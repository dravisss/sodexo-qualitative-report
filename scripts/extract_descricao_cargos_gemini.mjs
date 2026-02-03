import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import 'dotenv/config';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

const PROJECT_ROOT = path.resolve(process.cwd());
const INPUT_DIR = path.join(
  PROJECT_ROOT,
  'evidencias',
  'blobs',
  'Descrição de cargo Frontline. FY26'
);
const OUT_DIR = path.join(
  PROJECT_ROOT,
  'evidencias',
  'blobs',
  'gemini',
  'descricao-cargos-fy26'
);

const CONCURRENCY = Number(process.env.GEMINI_CONCURRENCY || 2);
const MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 4);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function listPdfFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.pdf'))
    .map((e) => path.join(dir, e.name))
    .sort((a, b) => a.localeCompare(b));
}

async function callGeminiPdfToJson({ pdfBuffer, fileName }) {
  if (!API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in environment');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent?key=${encodeURIComponent(API_KEY)}`;

  const prompt = [
    'Você receberá um PDF (possivelmente escaneado) com um “FORMULÁRIO DE DESCRIÇÃO DE CARGOS” da Sodexo.',
    'Extraia as informações em JSON estrito (sem markdown, sem comentários).',
    'Se algum campo não estiver claro, use null ou lista vazia.',
    '',
    'Schema (JSON):',
    '{',
    '  "source_file": string,',
    '  "cargo_titulo": string|null,',
    '  "codigo_cargo": string|null,',
    '  "contexto_organizacional": string|null,',
    '  "subordinado_a": string|null,',
    '  "descricao_sumaria": string|null,',
    '  "principais_atividades": string[],',
    '  "kpis": string[],',
    '  "observacoes": string|null',
    '}',
    '',
    `source_file deve ser exatamente: ${fileName}`,
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
              data: pdfBuffer.toString('base64'),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

      if (!outText) {
        throw new Error('Empty model output');
      }

      return JSON.parse(outText);
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      const backoff = 1000 * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }

  throw new Error('Unexpected retry exhaustion');
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function processOne(pdfPath) {
  const fileName = path.basename(pdfPath);
  const pdf = await fs.readFile(pdfPath);
  const sha256 = sha256Hex(pdf);

  const outFile = path.join(OUT_DIR, `${fileName}.json`);
  if (await fileExists(outFile)) {
    return { fileName, status: 'skipped_existing', outFile, sha256 };
  }

  const extracted = await callGeminiPdfToJson({ pdfBuffer: pdf, fileName });

  const payload = {
    ...extracted,
    source_file: fileName,
    source_path: path.relative(PROJECT_ROOT, pdfPath),
    source_sha256: sha256,
  };

  await fs.writeFile(outFile, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return { fileName, status: 'ok', outFile, sha256 };
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
          error: err?.message || String(err),
        };
      }
    }
  }

  const runners = Array.from({ length: Math.max(1, concurrency) }, () => run());
  await Promise.all(runners);
  return results;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const pdfs = await listPdfFiles(INPUT_DIR);
  if (!pdfs.length) {
    throw new Error(`No PDFs found in ${INPUT_DIR}`);
  }

  const results = await runPool(pdfs, processOne, CONCURRENCY);

  const consolidated = {
    model: MODEL,
    input_dir: path.relative(PROJECT_ROOT, INPUT_DIR),
    output_dir: path.relative(PROJECT_ROOT, OUT_DIR),
    generated_at: new Date().toISOString(),
    results,
  };

  await fs.writeFile(
    path.join(OUT_DIR, '_consolidado.json'),
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
  console.log(`Output: ${path.relative(PROJECT_ROOT, OUT_DIR)}`);

  if (errors > 0) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exitCode = 1;
});
