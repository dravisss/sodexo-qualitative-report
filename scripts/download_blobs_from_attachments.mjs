import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PROJECT_ROOT = path.resolve(process.cwd());
const ATTACHMENTS_PATH = path.join(PROJECT_ROOT, 'evidencias', 'banco', 'attachments.json');
const OUT_DIR = path.join(PROJECT_ROOT, 'evidencias', 'blobs');

const BLOBS_HTTP_BASE = process.env.BLOBS_HTTP_BASE || 'https://relatoriosdx.netlify.app';

function isXlsxPath(p) {
  return String(p).toLowerCase().endsWith('.xlsx');
}

function unzipTest(p) {
  return new Promise((resolve) => {
    const child = spawn('unzip', ['-t', p], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => (out += d.toString('utf8')));
    child.stderr.on('data', (d) => (out += d.toString('utf8')));
    child.on('close', (code) => {
      const ok = code === 0 && out.includes('No errors detected');
      resolve(ok);
    });
  });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function runNetlifyBlobsGet(store, key, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'netlify',
      ['blobs:get', store, key, '--output', outputPath],
      { stdio: 'inherit' }
    );

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`netlify blobs:get failed with exit code ${code}`));
    });
  });
}

async function downloadViaHttp(key, outputPath) {
  const url = new URL('/api/download-blob', BLOBS_HTTP_BASE);
  url.searchParams.set('key', key);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} (${url.toString()}): ${text.slice(0, 200)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outputPath, buf);
}

async function main() {
  const storeName = process.env.NETLIFY_BLOBS_STORE || 'evidence-files';
  const preferHttp = (process.env.BLOBS_DOWNLOAD_MODE || 'http').toLowerCase() !== 'cli';

  await fs.mkdir(OUT_DIR, { recursive: true });

  const raw = await fs.readFile(ATTACHMENTS_PATH, 'utf8');
  const attachments = JSON.parse(raw);

  const results = {
    downloaded: [],
    skipped_existing: [],
    failed: []
  };

  for (const a of attachments) {
    const key = a?.blob_key;
    const fileName = a?.file_name || (key ? path.basename(key) : null);

    if (!key || !fileName) continue;

    const outPath = path.join(OUT_DIR, fileName);

    if (await fileExists(outPath)) {
      if (!isXlsxPath(outPath)) {
        results.skipped_existing.push({ fileName, key });
        continue;
      }
      if (await unzipTest(outPath)) {
        results.skipped_existing.push({ fileName, key });
        continue;
      }
    }

    try {
      if (preferHttp) {
        try {
          await downloadViaHttp(key, outPath);
        } catch {
          await runNetlifyBlobsGet(storeName, key, outPath);
        }
      } else {
        await runNetlifyBlobsGet(storeName, key, outPath);
      }
      results.downloaded.push({ fileName, key });
    } catch (err) {
      results.failed.push({ fileName, key, error: err?.message || String(err) });
    }
  }

  const reportPath = path.join(PROJECT_ROOT, 'evidencias', 'indice', 'blobs-download-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2) + '\n', 'utf8');

  console.log('---');
  console.log(`Downloaded: ${results.downloaded.length}`);
  console.log(`Skipped existing: ${results.skipped_existing.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Report: ${reportPath}`);

  if (results.failed.length) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error('Downloader failed:', err?.message || err);
  process.exitCode = 1;
});
