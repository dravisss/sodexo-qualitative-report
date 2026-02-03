import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PROJECT_ROOT = path.resolve(process.cwd());

function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--input') args.input = argv[++i];
    else if (a === '--output') args.output = argv[++i];
  }
  if (!args.input || !args.output) {
    throw new Error('Usage: node scripts/reexport_xlsx_numbers.mjs --input <xlsx> --output <xlsx>');
  }
  return args;
}

function spawnOsaScript(scriptPath, inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('osascript', [scriptPath, inputPath, outputPath], { stdio: 'pipe' });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function main() {
  const args = parseArgs(process.argv);

  const inputAbs = path.isAbsolute(args.input) ? args.input : path.join(PROJECT_ROOT, args.input);
  const outputAbs = path.isAbsolute(args.output) ? args.output : path.join(PROJECT_ROOT, args.output);

  await fs.mkdir(path.dirname(outputAbs), { recursive: true });

  const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'reexport_xlsx_numbers.applescript');

  const { code, stdout, stderr } = await spawnOsaScript(scriptPath, inputAbs, outputAbs);

  if (code !== 0) {
    throw new Error(`Numbers reexport failed (code ${code}). stderr: ${stderr.slice(0, 1000)}`);
  }

  const st = await fs.stat(outputAbs);
  if (st.size === 0) {
    throw new Error('Numbers reexport produced empty output file');
  }

  process.stdout.write(stdout);
  process.stderr.write(stderr);
  console.log(`OK: ${path.relative(PROJECT_ROOT, outputAbs)} (${st.size} bytes)`);
}

await main();
