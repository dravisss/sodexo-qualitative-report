import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const PROJECT_ROOT = path.resolve(process.cwd());
const BLOBS_DIR = path.join(PROJECT_ROOT, 'evidencias', 'blobs');
const CSV_DIR = path.join(BLOBS_DIR, 'csv');

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function slugify(name) {
  return String(name)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/ /g, '_')
    .replace(/_+/g, '_')
    .slice(0, 140);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listXlsxFiles(rootDir) {
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        const rel = path.relative(rootDir, p);
        const parts = rel.split(path.sep).filter(Boolean);
        if (parts[0] === 'csv') continue;
        if (parts.includes('_legacy_corrupt')) continue;
        if (parts.includes('_tmp_redownload')) continue;
        if (parts.includes('_repaired')) continue;
        if (parts.some((x) => x.startsWith('_tmp_'))) continue;
        await walk(p);
      }
      else if (e.isFile() && e.name.toLowerCase().endsWith('.xlsx')) out.push(p);
    }
  }
  await walk(rootDir);
  return out.sort((a, b) => a.localeCompare(b));
}

function guessCategory(fileName) {
  const n = String(fileName).toLowerCase();
  if (n.includes('sap')) return 'sap';
  if (n.includes('tabela salarial') || n.includes('frontline')) return 'remuneracao';
  if (n.includes('cardápio') || n.includes('cardapio')) return 'cardapios';
  if (n.includes('aviso') || n.includes('indenizado')) return 'rescisao';
  return 'outros';
}

function spawnSofficeConvert({ inputPath, outDir }) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'soffice',
      ['--headless', '--convert-to', 'csv', '--outdir', outDir, inputPath],
      { stdio: 'pipe' }
    );

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function main() {
  const xlsxFiles = await listXlsxFiles(BLOBS_DIR);

  const results = [];
  for (const p of xlsxFiles) {
    const fileName = path.basename(p);
    const rel = path.relative(PROJECT_ROOT, p);

    const buf = await fs.readFile(p);
    const sha256 = sha256Hex(buf);

    const category = guessCategory(fileName);
    const base = slugify(fileName.replace(/\.xlsx$/i, ''));
    const outDir = path.join(CSV_DIR, category, base);
    await fs.mkdir(outDir, { recursive: true });

    const expectedOut = path.join(outDir, `${fileName.replace(/\.xlsx$/i, '')}.csv`);
    if (await fileExists(expectedOut)) {
      results.push({ fileName, input: rel, category, outDir: path.relative(PROJECT_ROOT, outDir), status: 'skipped_existing', sha256 });
      continue;
    }

    const { code, stdout, stderr } = await spawnSofficeConvert({ inputPath: p, outDir });

    // LibreOffice sometimes prints "Error: source file could not be loaded" even with code=0.
    const outFiles = await fs.readdir(outDir).catch(() => []);

    let status = 'ok';
    if (code !== 0) status = 'error';
    if (!outFiles.length) status = 'error';
    // LibreOffice can be noisy on stderr; if it produced output files, treat as OK.
    if (outFiles.length > 0) status = 'ok';

    results.push({
      fileName,
      input: rel,
      category,
      outDir: path.relative(PROJECT_ROOT, outDir),
      outFiles,
      status,
      sha256,
      stdout: stdout.trim().slice(0, 500),
      stderr: stderr.trim().slice(0, 500)
    });
  }

  const consolidated = {
    generated_at: new Date().toISOString(),
    blobs_dir: path.relative(PROJECT_ROOT, BLOBS_DIR),
    output_root: path.relative(PROJECT_ROOT, CSV_DIR),
    results
  };

  const reportPath = path.join(CSV_DIR, '_xlsx_to_csv_soffice.consolidado.json');
  await fs.writeFile(reportPath, JSON.stringify(consolidated, null, 2) + '\n', 'utf8');

  const ok = results.filter((r) => r.status === 'ok').length;
  const skipped = results.filter((r) => r.status === 'skipped_existing').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`XLSX: ${results.length}`);
  console.log(`OK: ${ok}`);
  console.log(`Skipped existing: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Report: ${path.relative(PROJECT_ROOT, reportPath)}`);

  if (errors > 0) process.exitCode = 2;
}

await main();
