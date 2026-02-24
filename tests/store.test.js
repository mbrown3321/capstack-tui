import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Point the store at a temp directory so tests never touch ~/.screenshot-organizer.
// This must be set before importing the store since DATA_DIR is resolved at import time.
const TEST_DIR = path.join(os.tmpdir(), 'capstack-test-' + process.pid);
process.env.CAPSTACK_DATA_DIR = TEST_DIR;

const { readIndex, writeIndex, upsertEntry, deleteEntry, makeEntry } = await import('../src/store/index.jsx');

const TEST_INDEX = path.join(TEST_DIR, 'index.json');
const FAKE_PATH = path.join(TEST_DIR, 'screenshot.png');

function makeFakeEntry(overrides = {}) {
  return {
    id: 'abc123',
    filename: 'screenshot.png',
    path: FAKE_PATH,
    project: 'my-project',
    tags: ['bug', 'ui'],
    notes: 'A test note',
    createdAt: new Date().toISOString(),
    indexedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// readIndex
// ---------------------------------------------------------------------------
describe('readIndex', () => {
  it('returns an empty array when the index file does not exist', () => {
    expect(readIndex()).toEqual([]);
  });

  it('returns parsed entries when the file exists', () => {
    const entries = [makeFakeEntry()];
    fs.writeFileSync(TEST_INDEX, JSON.stringify(entries));
    expect(readIndex()).toEqual(entries);
  });

  it('returns an empty array when the index file contains invalid JSON', () => {
    fs.writeFileSync(TEST_INDEX, 'not valid json {{');
    expect(readIndex()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// writeIndex
// ---------------------------------------------------------------------------
describe('writeIndex', () => {
  it('creates the data directory if it does not exist', () => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    writeIndex([makeFakeEntry()]);
    expect(fs.existsSync(TEST_INDEX)).toBe(true);
  });

  it('serialises entries to disk and can be read back', () => {
    const entries = [makeFakeEntry(), makeFakeEntry({ id: 'xyz789', filename: 'other.png' })];
    writeIndex(entries);
    const read = JSON.parse(fs.readFileSync(TEST_INDEX, 'utf-8'));
    expect(read).toEqual(entries);
  });
});

// ---------------------------------------------------------------------------
// upsertEntry
// ---------------------------------------------------------------------------
describe('upsertEntry', () => {
  it('prepends a new entry when the id does not exist', () => {
    upsertEntry(makeFakeEntry({ id: 'first' }));
    upsertEntry(makeFakeEntry({ id: 'second' }));

    const entries = readIndex();
    expect(entries[0].id).toBe('second'); // most recent first
    expect(entries).toHaveLength(2);
  });

  it('updates an existing entry in place without adding a duplicate', () => {
    const entry = makeFakeEntry();
    upsertEntry(entry);
    upsertEntry({ ...entry, notes: 'Updated note' });

    const entries = readIndex();
    expect(entries).toHaveLength(1);
    expect(entries[0].notes).toBe('Updated note');
  });
});

// ---------------------------------------------------------------------------
// deleteEntry
// ---------------------------------------------------------------------------
describe('deleteEntry', () => {
  it('removes the entry with the given id', () => {
    upsertEntry(makeFakeEntry({ id: 'keep' }));
    upsertEntry(makeFakeEntry({ id: 'remove' }));

    deleteEntry('remove');

    const entries = readIndex();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('keep');
  });

  it('is a no-op when the id does not exist', () => {
    upsertEntry(makeFakeEntry({ id: 'keep' }));
    deleteEntry('nonexistent');
    expect(readIndex()).toHaveLength(1);
  });

  it('results in an empty index when the only entry is deleted', () => {
    upsertEntry(makeFakeEntry());
    deleteEntry('abc123');
    expect(readIndex()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// makeEntry
// ---------------------------------------------------------------------------
describe('makeEntry', () => {
  it('derives filename and path from the file path argument', () => {
    fs.writeFileSync(FAKE_PATH, '');
    const entry = makeEntry(FAKE_PATH);
    expect(entry.filename).toBe('screenshot.png');
    expect(entry.path).toBe(FAKE_PATH);
  });

  it('generates a deterministic id based on the file path', () => {
    fs.writeFileSync(FAKE_PATH, '');
    const a = makeEntry(FAKE_PATH);
    const b = makeEntry(FAKE_PATH);
    expect(a.id).toBe(b.id);
  });

  it('initialises project, tags, and notes to empty defaults', () => {
    fs.writeFileSync(FAKE_PATH, '');
    const entry = makeEntry(FAKE_PATH);
    expect(entry.project).toBe('');
    expect(entry.tags).toEqual([]);
    expect(entry.notes).toBe('');
  });

  it('sets indexedAt to approximately now', () => {
    fs.writeFileSync(FAKE_PATH, '');
    const before = Date.now();
    const entry = makeEntry(FAKE_PATH);
    const after = Date.now();
    const indexed = new Date(entry.indexedAt).getTime();
    expect(indexed).toBeGreaterThanOrEqual(before);
    expect(indexed).toBeLessThanOrEqual(after);
  });
});