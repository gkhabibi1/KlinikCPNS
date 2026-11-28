import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, 'bank-soal-all-18111.txt');
const RAW_DIR = path.join(ROOT, 'hots-batches', 'raw');
const HOTS_DIR = path.join(ROOT, 'hots-batches', 'hots');
const MERGED_FILE = path.join(ROOT, 'hots-batches', 'merged-hots-all.txt');

const mode = process.argv[2] || 'split';
const batchSize = Number(process.argv[3]) || 100;

if (mode === 'split') {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('Source file not found:', SOURCE_FILE);
    process.exit(1);
  }
  const raw = fs.readFileSync(SOURCE_FILE, 'utf8').replace(/\r\n/g, '\n');
  const blocks = raw.split(/\n---+\n/).map((b) => b.trim()).filter(Boolean);

  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(HOTS_DIR, { recursive: true });

  const totalBatches = Math.ceil(blocks.length / batchSize);
  for (let i = 0; i < totalBatches; i++) {
    const slice = blocks.slice(i * batchSize, (i + 1) * batchSize);
    const num = String(i + 1).padStart(3, '0');
    const outPath = path.join(RAW_DIR, `batch-${num}.txt`);
    fs.writeFileSync(outPath, slice.join('\n\n---\n\n') + '\n', 'utf8');
  }

  console.log(`Split ${blocks.length} questions into ${totalBatches} files (${batchSize}/batch) at ${RAW_DIR}`);
} else if (mode === 'merge') {
  if (!fs.existsSync(HOTS_DIR)) {
    console.error('HOTS directory not found:', HOTS_DIR);
    process.exit(1);
  }
  const files = fs
    .readdirSync(HOTS_DIR)
    .filter((f) => f.endsWith('.txt'))
    .sort();

  if (files.length === 0) {
    console.error('No .txt files found in', HOTS_DIR);
    process.exit(1);
  }

  const allBlocks = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(HOTS_DIR, file), 'utf8').replace(/\r\n/g, '\n');
    const blocks = content.split(/\n---+\n/).map((b) => b.trim()).filter(Boolean);
    allBlocks.push(...blocks);
  }

  fs.writeFileSync(MERGED_FILE, allBlocks.join('\n\n---\n\n') + '\n', 'utf8');
  console.log(`Merged ${files.length} files (${allBlocks.length} questions) -> ${MERGED_FILE}`);
} else {
  console.log('Usage: node scripts/split-merge-bank.mjs [split|merge] [batchSize]');
}
