import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import 'dotenv/config';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

const PROJECT_ROOT = path.resolve(process.cwd());

const CONCURRENCY = Number(process.env.GEMINI_CONCURRENCY || 2);
const MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 4);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const args = {
    input: null,
    outdir: null,
    category: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--input') args.input = argv[++i];
    else if (a === '--outdir') args.outdir = argv[++i];
    else if (a === '--category') args.category = argv[++i];
  }

  if (!args.input || !args.outdir) {
    throw new Error('Usage: node scripts/extract_pdf_text_gemini.mjs --input <file-or-dir> --outdir <dir> [--category <name>]');
  }

  return args;
}

async function listPdfFiles(target) {
  const st = await fs.stat(target);
  if (st.isFile()) return [target];

  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.pdf')) out.push(p);
    }
  }

  await walk(target);
  return out.sort((a, b) => a.localeCompare(b));
}

async function callGeminiPdfToText({ pdfBuffer, fileName }) {
  if (!API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in environment');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent?key=${encodeURIComponent(API_KEY)}`;

  const prompt = [
    'Você receberá um PDF (pode ser escaneado).',
    'Gere APENAS TEXTO PURO (sem markdown).',
    'Objetivo: permitir busca e citação posterior.',
    '',
    'Regras:',
    '- Preserve títulos e subtítulos quando existirem.',
    '- Preserve tabelas como texto alinhado quando possível (linhas/colunas com separador |).',
    '- Se houver trechos ilegíveis, escreva: [ilegível].',
    '- Não invente conteúdo.',
    '- No topo, inclua: source_file: <NOME_EXATO_DO_ARQUIVO.pdf>',
    '',
    `source_file deve ser exatamente: ${fileName}`
  ].join('\n');

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: pdfBuffer.toString('base64')
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    }
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const text = await res.text();

      if (!res.ok) {
        const retryable = [429, 500, 502, 503, 504].includes(res.status);
        if (retryable && attempt < MAX_RETRIES) {
          const backoff = 1000 * Math.pow(2, attempt);
          await sleep(backoff);
          continue;
        }
        throw new Error(`Gemini HTTP ${res.status}: ${text.slice(0, 500)}`);
      }

      const json = JSON.parse(text);
      const outText =
        json?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join('') || '';

      if (!outText) throw new Error('Empty model output');
      return outText;
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      const backoff = 1000 * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }

  throw new Error('Unexpected retry exhaustion');
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let idx = 0;

  async function run() {
    while (idx < items.length) {
      const current = idx++;
      const item = items[current];
      try {
        results[current] = await worker(item);
      } catch (err) {
        results[current] = {
          fileName: path.basename(item),
          status: 'error',
          error: err?.message || String(err)
        };
      }
    }
  }

  const runners = Array.from({ length: Math.max(1, concurrency) }, () => run());
  await Promise.all(runners);
  return results;
}

async function processOne({ pdfPath, outDir }) {
  const fileName = path.basename(pdfPath);
  const pdf = await fs.readFile(pdfPath);
  const sha256 = sha256Hex(pdf);

  const outFile = path.join(outDir, `${fileName}.txt`);
  if (await fileExists(outFile)) {
    return { fileName, status: 'skipped_existing', outFile, sha256 };
  }

  const extracted = await callGeminiPdfToText({ pdfBuffer: pdf, fileName });
  const payload = [
    `source_file: ${fileName}`,
    `source_path: ${path.relative(PROJECT_ROOT, pdfPath)}`,
    `source_sha256: ${sha256}`,
    '',
    extracted.trim()
  ].join('\n');

  await fs.writeFile(outFile, payload + '\n', 'utf8');
  return { fileName, status: 'ok', outFile, sha256 };
}

async function main() {
  const args = parseArgs(process.argv);

  const outDir = path.isAbsolute(args.outdir)
    ? args.outdir
    : path.join(PROJECT_ROOT, args.outdir);

  await fs.mkdir(outDir, { recursive: true });

  const inputPath = path.isAbsolute(args.input)
    ? args.input
    : path.join(PROJECT_ROOT, args.input);

  const pdfs = await listPdfFiles(inputPath);
  if (!pdfs.length) throw new Error(`No PDFs found in ${inputPath}`);

  const results = await runPool(
    pdfs,
    async (p) => processOne({ pdfPath: p, outDir }),
    CONCURRENCY
  );

  const consolidated = {
    model: MODEL,
    input: path.relative(PROJECT_ROOT, inputPath),
    output_dir: path.relative(PROJECT_ROOT, outDir),
    generated_at: new Date().toISOString(),
    results
  };

  await fs.writeFile(
    path.join(outDir, '_consolidado.json'),
    JSON.stringify(consolidated, null, 2) + '\n',
    'utf8'
  );

  const ok = results.filter((r) => r?.status === 'ok').length;
  const skipped = results.filter((r) => r?.status === 'skipped_existing').length;
  const errors = results.filter((r) => r?.status === 'error').length;

  console.log(`PDFs: ${pdfs.length}`);
  console.log(`OK: ${ok}`);
  console.log(`Skipped existing: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Output: ${path.relative(PROJECT_ROOT, outDir)}`);

  if (errors > 0) process.exitCode = 2;
}

await main();
