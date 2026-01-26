import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd());
const IN_PATH = path.join(PROJECT_ROOT, 'evidencias', 'banco', 'submissions.json');
const OUT_PATH = path.join(PROJECT_ROOT, 'evidencias', 'banco', 'submissions_normalized.json');

function tryReconstructCharMap(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

  const keys = Object.keys(obj);
  if (keys.length === 0) return null;

  const allNumeric = keys.every((k) => {
    const n = Number.parseInt(k, 10);
    return Number.isFinite(n) && String(n) === k;
  });

  if (!allNumeric) return null;

  const maxIndex = keys.reduce((max, k) => {
    const n = Number.parseInt(k, 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  const chars = [];
  for (let i = 0; i <= maxIndex; i += 1) {
    const v = obj[String(i)];
    if (v !== undefined) chars.push(v);
  }

  const reconstructed = chars.join('');
  try {
    return JSON.parse(reconstructed);
  } catch {
    return null;
  }
}

function normalizeAnswers(answers) {
  if (!answers) return {};

  if (typeof answers === 'string') {
    try {
      return JSON.parse(answers);
    } catch {
      return {};
    }
  }

  if (typeof answers === 'object') {
    const reconstructed = tryReconstructCharMap(answers);
    if (reconstructed) return reconstructed;
    return answers;
  }

  return {};
}

async function main() {
  const raw = await fs.readFile(IN_PATH, 'utf8');
  const submissions = JSON.parse(raw);

  const normalized = submissions.map((s) => {
    const answers = normalizeAnswers(s.answers);
    return {
      ...s,
      answers,
      answers_normalized: true
    };
  });

  await fs.writeFile(OUT_PATH, JSON.stringify(normalized, null, 2) + '\n', 'utf8');

  const stats = {
    submissions: submissions.length,
    normalized: normalized.filter((s) => s.answers_normalized).length
  };

  console.log(`Wrote: ${OUT_PATH}`);
  console.log(JSON.stringify(stats));
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exitCode = 1;
});
