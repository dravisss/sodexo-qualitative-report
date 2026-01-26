import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const PROJECT_ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(PROJECT_ROOT, 'evidencias', 'banco');
const INDEX_DIR = path.join(PROJECT_ROOT, 'evidencias', 'indice');

const DEFAULT_UNIT_SLUGS = ['cajamar', 'gru-food', 'gru-fm'];

function parseArgs(argv) {
  const args = {
    all: false,
    unitSlugs: null
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--all') {
      args.all = true;
      continue;
    }
    if (a === '--unit') {
      const value = argv[i + 1];
      if (!value) throw new Error('Missing value for --unit');
      args.unitSlugs = value.split(',').map(s => s.trim()).filter(Boolean);
      i += 1;
      continue;
    }
  }

  return args;
}

function safeJsonStringify(value) {
  return JSON.stringify(value, null, 2);
}

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(INDEX_DIR, { recursive: true });
}

async function main() {
  const connectionString = process.env.NETLIFY_DATABASE_URL;
  if (!connectionString) {
    throw new Error('NETLIFY_DATABASE_URL not set. Ensure .env exists and is loaded.');
  }

  const { all, unitSlugs } = parseArgs(process.argv);
  const scopeUnitSlugs = all ? null : (unitSlugs ?? DEFAULT_UNIT_SLUGS);

  await ensureDirs();

  const sql = postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 20
  });

  try {
    // 1) Submissions
    const submissions = scopeUnitSlugs
      ? await sql`
          SELECT
            id,
            unit_slug,
            cycle_id,
            status,
            respondent_info,
            answers,
            last_synced_at,
            created_at,
            updated_at
          FROM submissions
          WHERE unit_slug = ANY(${scopeUnitSlugs})
          ORDER BY updated_at DESC
        `
      : await sql`
          SELECT
            id,
            unit_slug,
            cycle_id,
            status,
            respondent_info,
            answers,
            last_synced_at,
            created_at,
            updated_at
          FROM submissions
          ORDER BY updated_at DESC
        `;

    const submissionIds = submissions.map(s => s.id);

    // 2) Attachments
    const attachments = submissionIds.length
      ? await sql`
          SELECT
            id,
            submission_id,
            field_id,
            file_name,
            blob_key,
            content_type,
            created_at
          FROM attachments
          WHERE submission_id = ANY(${submissionIds})
          ORDER BY created_at ASC
        `
      : [];

    // 3) Individual answers with metadata (preferred for analysis)
    const answers = submissionIds.length
      ? await sql`
          SELECT
            id,
            submission_id,
            field_id,
            field_type,
            section_name,
            subsection_name,
            question_text,
            answer_value,
            created_at,
            updated_at
          FROM answers
          WHERE submission_id = ANY(${submissionIds})
          ORDER BY submission_id, section_name NULLS LAST, subsection_name NULLS LAST, field_id
        `
      : [];

    // Write JSON exports
    await fs.writeFile(path.join(OUT_DIR, 'submissions.json'), safeJsonStringify(submissions), 'utf8');
    await fs.writeFile(path.join(OUT_DIR, 'attachments.json'), safeJsonStringify(attachments), 'utf8');
    await fs.writeFile(path.join(OUT_DIR, 'answers.json'), safeJsonStringify(answers), 'utf8');

    // Minimal index (Markdown) to start Phase 3
    const now = new Date().toISOString();
    const slugsInExport = Array.from(new Set(submissions.map(s => s.unit_slug))).sort();
    const countsByUnit = slugsInExport.map(slug => {
      const sCount = submissions.filter(s => s.unit_slug === slug).length;
      const aCount = attachments.filter(a => String(a.submission_id) && submissions.some(s => String(s.id) === String(a.submission_id) && s.unit_slug === slug)).length;
      const ansCount = answers.filter(ans => submissions.some(s => String(s.id) === String(ans.submission_id) && s.unit_slug === slug)).length;
      return { slug, submissions: sCount, answers: ansCount, attachments: aCount };
    });

    const blobKeys = attachments.map(a => a.blob_key).filter(Boolean);

    const scopeLabel = scopeUnitSlugs ? scopeUnitSlugs.join(', ') : 'ALL';
    const indexMd = [
      '# Inventário — Export do Banco',
      '',
      `Gerado em: ${now}`,
      '',
      '## Escopo',
      '',
      `- Unidades: ${scopeLabel}`,
      '',
      '## Arquivos gerados (em evidencias/banco)',
      '',
      '- submissions.json',
      '- answers.json',
      '- attachments.json',
      '',
      '## Contagens por unidade',
      '',
      ...countsByUnit.map(r => `- ${r.slug}: submissions=${r.submissions}, answers=${r.answers}, attachments=${r.attachments}`),
      '',
      '## Blob keys (para download posterior)',
      '',
      ...blobKeys.map(k => `- ${k}`)
    ].join('\n');

    await fs.writeFile(path.join(INDEX_DIR, 'inventario-banco.md'), indexMd + '\n', 'utf8');

    // Also write blob keys as plain text for scripting
    await fs.writeFile(path.join(OUT_DIR, 'blob_keys.txt'), blobKeys.join('\n') + '\n', 'utf8');

    console.log(`Export concluído. Submissions=${submissions.length}, Answers=${answers.length}, Attachments=${attachments.length}`);
    console.log(`Arquivos em: ${OUT_DIR}`);
    console.log(`Inventário em: ${path.join(INDEX_DIR, 'inventario-banco.md')}`);

  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('Falha no export:', err?.message || err);
  process.exitCode = 1;
});
