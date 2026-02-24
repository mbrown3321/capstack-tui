import fs from 'fs';
import path from 'path';
import os from 'os';

const DATA_DIR = process.env.CAPSTACK_DATA_DIR ?? path.join(os.homedir(), '.screenshot-organizer');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readIndex() {
  ensureDataDir();
  if (!fs.existsSync(INDEX_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function writeIndex(entries) {
  ensureDataDir();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(entries, null, 2));
}

export function upsertEntry(entry) {
  const entries = readIndex();
  const idx = entries.findIndex(e => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  writeIndex(entries);
  return entries;
}

export function deleteEntry(id) {
  const entries = readIndex().filter(e => e.id !== id);
  writeIndex(entries);
  return entries;
}

export function makeEntry(filePath) {
  const stats = fs.statSync(filePath);
  return {
    id: Buffer.from(filePath).toString('base64'), // Use full base64 to avoid collisions
    filename: path.basename(filePath),
    path: filePath,
    project: '',
    tags: [],
    notes: '',
    createdAt: stats.birthtime.toISOString(),
    indexedAt: new Date().toISOString(),
  };
}