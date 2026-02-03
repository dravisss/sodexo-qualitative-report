import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PROJECT_ROOT = path.resolve(process.cwd());

const EXPORT_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'export_evidencias.mjs');
const NORMALIZE_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'normalize_answers_export.mjs');

const BANK_DIR = path.join(PROJECT_ROOT, 'evidencias', 'banco');
const INDEX_DIR = path.join(PROJECT_ROOT, 'evidencias', 'indice');
const BLOBS_DIR = path.join(PROJECT_ROOT, 'evidencias', 'blobs');

const PREVIOUS_DIR = path.join(BANK_DIR, '_previous');

const TABLES_DIR = path.join(INDEX_DIR, 'tabelas');

const ATTACHMENTS_PATH = path.join(BANK_DIR, 'attachments.json');
const CACHE_PATH = path.join(INDEX_DIR, 'attachments_cache.json');

const SUBMISSIONS_PATH = path.join(BANK_DIR, 'submissions.json');
const ANSWERS_PATH = path.join(BANK_DIR, 'answers.json');

const ROTEIRO_PATH = path.join(PROJECT_ROOT, 'Refined', 'roteiro-investigacao-unidades.md');

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

function spawnNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`node ${args.join(' ')} failed with exit code ${code}`));
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

function runNetlifyBlobsGet(store, key, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('netlify', ['blobs:get', store, key, '--output', outputPath], {
      stdio: 'inherit'
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`netlify blobs:get failed with exit code ${code}`));
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

async function tryReadJson(p) {
  try {
    if (!(await fileExists(p))) return null;
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function snapshotPreviousExports() {
  await fs.mkdir(PREVIOUS_DIR, { recursive: true });

  const files = [
    { from: SUBMISSIONS_PATH, to: path.join(PREVIOUS_DIR, 'submissions.json') },
    { from: ANSWERS_PATH, to: path.join(PREVIOUS_DIR, 'answers.json') },
    { from: ATTACHMENTS_PATH, to: path.join(PREVIOUS_DIR, 'attachments.json') }
  ];

  for (const f of files) {
    if (!(await fileExists(f.from))) continue;
    const raw = await fs.readFile(f.from, 'utf8');
    await fs.writeFile(f.to, raw, 'utf8');
  }

  await fs.writeFile(
    path.join(PREVIOUS_DIR, 'updated_at.json'),
    JSON.stringify({ updated_at: new Date().toISOString() }, null, 2) + '\n',
    'utf8'
  );
}

function indexById(rows) {
  const map = new Map();
  if (!Array.isArray(rows)) return map;
  for (const r of rows) {
    const id = r?.id;
    if (!id) continue;
    map.set(String(id), r);
  }
  return map;
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj?.[k] ?? null;
  return out;
}

function computeDelta({ prevRows, nextRows, idKey = 'id', changedPredicate, pickKeys, maxItems = 200 }) {
  const prev = Array.isArray(prevRows) ? prevRows : [];
  const next = Array.isArray(nextRows) ? nextRows : [];

  const prevMap = new Map();
  for (const r of prev) {
    const id = r?.[idKey];
    if (!id) continue;
    prevMap.set(String(id), r);
  }

  const nextMap = new Map();
  for (const r of next) {
    const id = r?.[idKey];
    if (!id) continue;
    nextMap.set(String(id), r);
  }

  const added = [];
  const changed = [];
  const removed = [];

  for (const [id, row] of nextMap.entries()) {
    const prevRow = prevMap.get(id);
    if (!prevRow) {
      added.push(pickKeys ? pick(row, pickKeys) : { id });
      continue;
    }

    if (changedPredicate && changedPredicate(prevRow, row)) {
      changed.push(pickKeys ? pick(row, pickKeys) : { id });
    }
  }

  for (const [id, row] of prevMap.entries()) {
    if (!nextMap.has(id)) {
      removed.push(pickKeys ? pick(row, pickKeys) : { id });
    }
  }

  const addedTruncated = added.length > maxItems;
  const changedTruncated = changed.length > maxItems;
  const removedTruncated = removed.length > maxItems;

  return {
    counts: {
      prev_total: prev.length,
      next_total: next.length,
      added: added.length,
      changed: changed.length,
      removed: removed.length
    },
    added_truncated: addedTruncated,
    changed_truncated: changedTruncated,
    removed_truncated: removedTruncated,
    added: addedTruncated ? added.slice(0, maxItems) : added,
    changed: changedTruncated ? changed.slice(0, maxItems) : changed,
    removed: removedTruncated ? removed.slice(0, maxItems) : removed
  };
}

function safeSlug(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N} ._\-]/gu, '')
    .slice(0, 180);
}

function toRelPath(p) {
  const rel = path.relative(path.join(PROJECT_ROOT, 'evidencias'), p);
  return rel.startsWith('..') ? p : path.join('..', rel).replaceAll('\\', '/');
}

function normalizeLabel(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function mapRoteiroParent(rawHeading) {
  const h = normalizeLabel(rawHeading);
  if (h.includes('due diligence operacional')) return 'Operacional';
  if (h.includes('relações sindicais')) return 'Sindical';
  if (h.includes('comercial')) return 'Comercial';
  if (h.includes('remuneração')) return 'Remuneração';
  if (h.includes('intervenções')) return 'Intervenções';
  return rawHeading ? String(rawHeading).trim() : null;
}

async function parseRoteiroHierarchy() {
  try {
    if (!(await fileExists(ROTEIRO_PATH))) return [];
    const raw = await fs.readFile(ROTEIRO_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);

    const out = [];
    let currentParentRaw = null;
    let currentParent = null;
    let currentSubCode = null;
    let currentSubTitle = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      if (line.startsWith('## ')) {
        currentParentRaw = line.slice(3).trim();
        currentParent = mapRoteiroParent(currentParentRaw);
        currentSubCode = null;
        currentSubTitle = null;
        continue;
      }

      if (line.startsWith('### ')) {
        const h = line.slice(4).trim();
        const m = /^([A-Z])\.?\s*(.+)$/.exec(h);
        if (m) {
          currentSubCode = m[1];
          currentSubTitle = m[2].trim();
        } else {
          currentSubCode = null;
          currentSubTitle = h;
        }
        continue;
      }

      if (line.startsWith('|') && (lines[i + 1] || '').startsWith('|---')) {
        const tableLines = [];
        tableLines.push(line);
        tableLines.push(lines[i + 1]);
        i += 2;
        while (i < lines.length && lines[i].startsWith('|')) {
          tableLines.push(lines[i]);
          i += 1;
        }
        i -= 1;

        const body = tableLines.slice(2);
        const rowLabels = [];
        for (const r of body) {
          const cells = r
            .split('|')
            .map((s) => s.trim())
            .filter((_, idx, arr) => !(idx === 0 || idx === arr.length - 1));
          const first = cells[0];
          if (first && first !== 'Dado') rowLabels.push(first);
        }

        if (currentParent && currentSubTitle && rowLabels.length) {
          out.push({
            parent: currentParent,
            subsection_code: currentSubCode,
            subsection_title: currentSubTitle,
            row_labels: rowLabels
          });
        }
      }
    }

    return out;
  } catch {
    return [];
  }
}

function parseTableCellFieldId(fieldId) {
  const m = /^table_(\d+)_row_(\d+)_col_(\d+)$/.exec(String(fieldId || ''));
  if (!m) return null;
  return { tableIndex: Number(m[1]), rowIndex: Number(m[2]), colIndex: Number(m[3]) };
}

function extractLinhaLabel(questionText) {
  const qt = String(questionText || '');
  const m = /\bLinha:\s*(.+)\s*$/.exec(qt);
  if (!m) return null;
  return m[1].trim();
}

function parseTableHeader(questionText) {
  const qt = String(questionText || '');
  const idx = qt.indexOf('Tabela:');
  if (idx === -1) return null;

  let rest = qt.slice(idx + 'Tabela:'.length).trim();
  const linhaIdx = rest.lastIndexOf('| Linha:');
  if (linhaIdx !== -1) rest = rest.slice(0, linhaIdx).trim();

  const parts = rest
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parts.length) return null;

  return {
    table_title: parts[0] || null,
    column_labels: parts.slice(1)
  };
}

function matchRoteiroForTable({ roteiroSections, rowLabels }) {
  const labels = (rowLabels || []).map(normalizeLabel).filter(Boolean);
  const labelSet = new Set(labels);
  if (!roteiroSections?.length || !labelSet.size) return null;

  let best = null;
  let bestScore = 0;

  for (const s of roteiroSections) {
    const candidates = (s.row_labels || []).map(normalizeLabel).filter(Boolean);
    let overlap = 0;
    for (const c of candidates) if (labelSet.has(c)) overlap += 1;
    if (overlap > bestScore) {
      bestScore = overlap;
      best = s;
    }
  }

  if (!best || bestScore < 2) return null;
  return { ...best, score: bestScore };
}

async function writeDerivedTables({ submissions, answers, roteiroSections }) {
  if (!Array.isArray(submissions) || !Array.isArray(answers)) return;

  const submissionIds = new Set(submissions.map((s) => String(s?.id)).filter(Boolean));
  const cells = answers.filter((a) => a && a.field_type === 'table_cell' && submissionIds.has(String(a.submission_id)));
  if (!cells.length) return;

  const bySubmission = new Map();
  for (const c of cells) {
    const sid = String(c.submission_id);
    if (!bySubmission.has(sid)) bySubmission.set(sid, []);
    bySubmission.get(sid).push(c);
  }

  for (const [submissionId, rows] of bySubmission.entries()) {
    const byTable = new Map();
    for (const r of rows) {
      const parsed = parseTableCellFieldId(r.field_id);
      if (!parsed) continue;
      const tableId = `table_${parsed.tableIndex}`;
      if (!byTable.has(tableId)) byTable.set(tableId, []);
      byTable.get(tableId).push({ ...r, _parsed: parsed });
    }

    for (const [tableId, trows] of byTable.entries()) {
      const outDir = path.join(TABLES_DIR, safeSlug(submissionId));
      await fs.mkdir(outDir, { recursive: true });

      const rowLabels = new Map();
      const colLabels = new Map();
      let tableTitle = null;
      let sectionName = null;
      let subsectionName = null;
      const maxRow = trows.reduce((m, r) => Math.max(m, r._parsed.rowIndex), 0);
      const maxCol = trows.reduce((m, r) => Math.max(m, r._parsed.colIndex), 0);

      for (const r of trows) {
        const label = extractLinhaLabel(r.question_text);
        if (label) rowLabels.set(r._parsed.rowIndex, label);

        if (!sectionName && r.section_name) sectionName = r.section_name;
        if (!subsectionName && r.subsection_name) subsectionName = r.subsection_name;

        const header = parseTableHeader(r.question_text);
        if (header) {
          if (!tableTitle && header.table_title) tableTitle = header.table_title;
          for (let i = 0; i < header.column_labels.length; i += 1) {
            const colIndex = i + 1;
            if (!colLabels.has(colIndex) && header.column_labels[i]) {
              colLabels.set(colIndex, header.column_labels[i]);
            }
          }
        }
      }

      const grid = Array.from({ length: maxRow + 1 }, () => Array.from({ length: maxCol + 1 }, () => null));
      for (const r of trows) {
        grid[r._parsed.rowIndex][r._parsed.colIndex] = {
          answer_id: r.id,
          field_id: r.field_id,
          row: r._parsed.rowIndex,
          col: r._parsed.colIndex,
          value: r.answer_value,
          updated_at: r.updated_at ?? null,
          question_text: r.question_text ?? null
        };
      }

      const columns = Array.from({ length: maxCol + 1 }, (_, i) => ({ col: i }));

      const columnsEnriched = columns.map((c) => {
        if (c.col === 0) return { ...c, label: 'Linha' };
        return { ...c, label: colLabels.get(c.col) || null };
      });

      const rowLabelList = Array.from(rowLabels.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v)
        .filter(Boolean);

      const roteiroMatch = matchRoteiroForTable({ roteiroSections, rowLabels: rowLabelList });

      const jsonOut = {
        generated_at: new Date().toISOString(),
        submission_id: submissionId,
        table_id: tableId,
        roteiro_parent: roteiroMatch?.parent ?? null,
        roteiro_subsection_code: roteiroMatch?.subsection_code ?? null,
        roteiro_subsection_title: roteiroMatch?.subsection_title ?? null,
        section_name: sectionName,
        subsection_name: subsectionName,
        table_title: tableTitle,
        dimensions: { rows: maxRow + 1, cols: maxCol + 1 },
        row_labels: Object.fromEntries([...rowLabels.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => [String(k), v])),
        columns: columnsEnriched,
        cells: grid
      };

      const jsonPath = path.join(outDir, `${tableId}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(jsonOut, null, 2) + '\n', 'utf8');

      const mdLines = [];
      mdLines.push(`# Tabela derivada — ${tableId}`);
      mdLines.push('');
      mdLines.push(`- submission_id: ${submissionId}`);
      mdLines.push(`- roteiro_parent: ${roteiroMatch?.parent ?? ''}`);
      mdLines.push(`- roteiro_subsection: ${roteiroMatch?.subsection_code ? `${roteiroMatch.subsection_code}. ${roteiroMatch.subsection_title}` : (roteiroMatch?.subsection_title ?? '')}`);
      mdLines.push(`- section_name: ${sectionName || ''}`);
      mdLines.push(`- subsection_name: ${subsectionName || ''}`);
      mdLines.push(`- table_title: ${tableTitle || ''}`);
      mdLines.push(`- arquivo (json): \`${toRelPath(jsonPath)}\``);
      mdLines.push('');

      mdLines.push('## Visão organizada');
      mdLines.push('');

      const headerCols = [];
      for (let c = 1; c <= maxCol; c += 1) {
        headerCols.push((colLabels.get(c) || `Col ${c}`).replaceAll('|', '\\|'));
      }

      mdLines.push(`| Linha | ${headerCols.join(' | ')} |`);
      mdLines.push(`|---|${headerCols.map(() => '---').join('|')}|`);

      for (let r = 1; r <= maxRow; r += 1) {
        const label = (rowLabels.get(r) || `Row ${r}`).replaceAll('|', '\\|');
        const vals = [];
        for (let c = 1; c <= maxCol; c += 1) {
          const cell = grid[r][c];
          const v = cell?.value === null || cell?.value === undefined ? '' : String(cell.value).replaceAll('|', '\\|').trim();
          vals.push(v);
        }
        mdLines.push(`| ${label} | ${vals.join(' | ')} |`);
      }

      mdLines.push('');
      mdLines.push('## Detalhe por célula (rastreabilidade)');
      mdLines.push('');
      mdLines.push('| row | label | col | col_label | value | answer_id | field_id | updated_at |');
      mdLines.push('|---:|---|---:|---|---|---|---|---|');
      for (let r = 0; r <= maxRow; r += 1) {
        const label = rowLabels.get(r) || '';
        for (let c = 0; c <= maxCol; c += 1) {
          const cell = grid[r][c];
          if (!cell) continue;
          const v = cell.value === null || cell.value === undefined ? '' : String(cell.value).replaceAll('|', '\\|').trim();
          const colLabel = (colLabels.get(c) || '').replaceAll('|', '\\|');
          mdLines.push(`| ${r} | ${String(label).replaceAll('|', '\\|')} | ${c} | ${colLabel} | ${v} | ${cell.answer_id || ''} | ${cell.field_id || ''} | ${cell.updated_at || ''} |`);
        }
      }

      const mdPath = path.join(outDir, `${tableId}.md`);
      await fs.writeFile(mdPath, mdLines.join('\n') + '\n', 'utf8');
    }
  }
}

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.downloaded_blob_keys)) return new Set(parsed.downloaded_blob_keys);
    if (parsed && Array.isArray(parsed.blob_keys)) return new Set(parsed.blob_keys);
  } catch {
    // ignore
  }
  return new Set();
}

async function writeCache(downloadedBlobKeys) {
  await fs.mkdir(INDEX_DIR, { recursive: true });
  const obj = {
    updated_at: new Date().toISOString(),
    downloaded_blob_keys: Array.from(downloadedBlobKeys)
  };
  await fs.writeFile(CACHE_PATH, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

async function main() {
  const storeName = process.env.NETLIFY_BLOBS_STORE || 'evidence-files';
  const preferHttp = (process.env.BLOBS_DOWNLOAD_MODE || 'http').toLowerCase() !== 'cli';

  const exportArgs = process.argv.slice(2);

  await snapshotPreviousExports();

  const prevSubmissions = await tryReadJson(path.join(PREVIOUS_DIR, 'submissions.json'));
  const prevAnswers = await tryReadJson(path.join(PREVIOUS_DIR, 'answers.json'));
  const prevAttachments = await tryReadJson(path.join(PREVIOUS_DIR, 'attachments.json'));

  await fs.mkdir(BLOBS_DIR, { recursive: true });
  await fs.mkdir(INDEX_DIR, { recursive: true });

  await spawnNode([EXPORT_SCRIPT, ...exportArgs]);
  await spawnNode([NORMALIZE_SCRIPT]);

  const raw = await fs.readFile(ATTACHMENTS_PATH, 'utf8');
  const attachments = JSON.parse(raw);

  const submissions = await tryReadJson(SUBMISSIONS_PATH);
  const answers = await tryReadJson(ANSWERS_PATH);

  const roteiroSections = await parseRoteiroHierarchy();
  await writeDerivedTables({ submissions, answers, roteiroSections });

  const downloadedPreviously = await loadCache();

  const newAttachments = [];

  for (const a of attachments) {
    const key = a?.blob_key;
    if (!key) continue;

    if (!downloadedPreviously.has(key)) {
      newAttachments.push(a);
      continue;
    }

    const fileName = safeSlug(a?.file_name || (key ? path.basename(key) : ''));
    const subDir = safeSlug(a?.submission_id || 'unknown');
    const fieldDir = safeSlug(a?.field_id || 'unknown');
    if (!fileName) continue;
    const outPath = path.join(BLOBS_DIR, subDir, fieldDir, fileName);

    if (!(await fileExists(outPath))) {
      newAttachments.push(a);
      continue;
    }

    if (isXlsxPath(outPath) && !(await unzipTest(outPath))) {
      newAttachments.push(a);
    }
  }

  const download = {
    downloaded: [],
    skipped_existing: [],
    failed: []
  };

  for (const a of newAttachments) {
    const key = a?.blob_key;
    const fileName = safeSlug(a?.file_name || (key ? path.basename(key) : ''));
    const subDir = safeSlug(a?.submission_id || 'unknown');
    const fieldDir = safeSlug(a?.field_id || 'unknown');

    if (!key || !fileName) continue;

    const outPath = path.join(BLOBS_DIR, subDir, fieldDir, fileName);
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    if (await fileExists(outPath)) {
      if (!isXlsxPath(outPath)) {
        download.skipped_existing.push({ fileName, key });
        downloadedPreviously.add(key);
        continue;
      }
      if (await unzipTest(outPath)) {
        download.skipped_existing.push({ fileName, key });
        downloadedPreviously.add(key);
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
      download.downloaded.push({ fileName, key });
      downloadedPreviously.add(key);
    } catch (err) {
      download.failed.push({ fileName, key, error: err?.message || String(err) });
    }
  }

  await writeCache(downloadedPreviously);

  const deltaSubmissions = computeDelta({
    prevRows: prevSubmissions,
    nextRows: submissions,
    changedPredicate: (a, b) => String(a?.updated_at || '') !== String(b?.updated_at || ''),
    pickKeys: ['id', 'unit_slug', 'cycle_id', 'status', 'updated_at', 'created_at']
  });

  const deltaAnswers = computeDelta({
    prevRows: prevAnswers,
    nextRows: answers,
    changedPredicate: (a, b) => {
      if (String(a?.updated_at || '') !== String(b?.updated_at || '')) return true;
      if (String(a?.answer_value ?? '') !== String(b?.answer_value ?? '')) return true;
      return false;
    },
    pickKeys: ['id', 'submission_id', 'field_id', 'field_type', 'section_name', 'subsection_name', 'updated_at']
  });

  const deltaAttachmentsRecords = computeDelta({
    prevRows: prevAttachments,
    nextRows: attachments,
    changedPredicate: (a, b) => String(a?.blob_key || '') !== String(b?.blob_key || ''),
    pickKeys: ['id', 'submission_id', 'field_id', 'file_name', 'blob_key', 'content_type', 'created_at']
  });

  const report = {
    generated_at: new Date().toISOString(),
    scope_args: exportArgs,
    counts: {
      attachments_total: attachments.length,
      new_attachments: newAttachments.length,
      downloaded: download.downloaded.length,
      skipped_existing: download.skipped_existing.length,
      failed: download.failed.length
    },
    delta: {
      submissions: deltaSubmissions,
      answers: deltaAnswers,
      attachments_records: deltaAttachmentsRecords
    },
    new_attachments: newAttachments.map((a) => {
      const key = a?.blob_key;
      const fileName = safeSlug(a?.file_name || (key ? path.basename(key) : ''));
      const subDir = safeSlug(a?.submission_id || 'unknown');
      const fieldDir = safeSlug(a?.field_id || 'unknown');
      const outPath = fileName ? path.join(BLOBS_DIR, subDir, fieldDir, fileName) : null;

      return {
        submission_id: a?.submission_id,
        field_id: a?.field_id,
        file_name: a?.file_name,
        blob_key: a?.blob_key,
        content_type: a?.content_type,
        local_path: outPath ? toRelPath(outPath) : null
      };
    }),
    download
  };

  const reportJsonPath = path.join(INDEX_DIR, 'atualizacao-inventario.report.json');
  const reportMdPath = path.join(INDEX_DIR, 'atualizacao-inventario.report.md');

  await fs.writeFile(reportJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  const mdLines = [];
  mdLines.push('# Atualização de inventário — relatório');
  mdLines.push('');
  mdLines.push(`Gerado em: ${report.generated_at}`);
  mdLines.push('');
  mdLines.push('## Escopo do export');
  mdLines.push('');
  mdLines.push(`- args: ${(exportArgs && exportArgs.length) ? exportArgs.join(' ') : '(default)'}`);
  mdLines.push('');
  mdLines.push('## Contagens');
  mdLines.push('');
  mdLines.push(`- attachments_total: ${report.counts.attachments_total}`);
  mdLines.push(`- new_attachments: ${report.counts.new_attachments}`);
  mdLines.push(`- downloaded: ${report.counts.downloaded}`);
  mdLines.push(`- skipped_existing: ${report.counts.skipped_existing}`);
  mdLines.push(`- failed: ${report.counts.failed}`);
  mdLines.push('');

  mdLines.push('## Delta (banco)');
  mdLines.push('');
  mdLines.push(`- submissions: prev=${report.delta.submissions.counts.prev_total}, next=${report.delta.submissions.counts.next_total}, added=${report.delta.submissions.counts.added}, changed=${report.delta.submissions.counts.changed}, removed=${report.delta.submissions.counts.removed}`);
  mdLines.push(`- answers: prev=${report.delta.answers.counts.prev_total}, next=${report.delta.answers.counts.next_total}, added=${report.delta.answers.counts.added}, changed=${report.delta.answers.counts.changed}, removed=${report.delta.answers.counts.removed}`);
  mdLines.push(`- attachments_records: prev=${report.delta.attachments_records.counts.prev_total}, next=${report.delta.attachments_records.counts.next_total}, added=${report.delta.attachments_records.counts.added}, changed=${report.delta.attachments_records.counts.changed}, removed=${report.delta.attachments_records.counts.removed}`);
  mdLines.push('');

  mdLines.push('## Novos anexos detectados');
  mdLines.push('');
  mdLines.push('| submission_id | field_id | arquivo | content_type | blob_key | local |');
  mdLines.push('|---|---|---|---|---|---|');

  for (const a of report.new_attachments) {
    const fileName = a.file_name ? String(a.file_name).replaceAll('|', '\\|') : '';
    const contentType = a.content_type ? String(a.content_type).replaceAll('|', '\\|') : '';
    const local = a.local_path ? `\`${a.local_path}\`` : '';
    const blobKey = a.blob_key ? String(a.blob_key).replaceAll('|', '\\|') : '';

    mdLines.push(`| ${a.submission_id || ''} | ${a.field_id || ''} | ${fileName} | ${contentType} | ${blobKey} | ${local} |`);
  }

  mdLines.push('');
  mdLines.push('## Próximas ações sugeridas');
  mdLines.push('');
  mdLines.push('- Atualizar `evidencias/indice/inventario-banco.md` (o export já atualiza este arquivo; apenas revisar).');
  mdLines.push('- Atualizar `evidencias/indice/inventario-geral.md` e `evidencias/indice/moc.md` com base na tabela acima (resumo + vínculo a I-XX).');
  mdLines.push('- Para planilhas novas: converter XLSX→CSV e salvar em `evidencias/blobs/csv/` (mesmo padrão já usado).');
  mdLines.push('- Para PDFs imagem novos: preferir extração via Gemini (script específico quando aplicável) ou OCR (fallback).');
  mdLines.push('');

  await fs.writeFile(reportMdPath, mdLines.join('\n') + '\n', 'utf8');

  console.log('---');
  console.log(`Report (MD): ${reportMdPath}`);
  console.log(`Report (JSON): ${reportJsonPath}`);

  if (download.failed.length) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exitCode = 1;
});
