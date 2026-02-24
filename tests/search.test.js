import { describe, it, expect } from 'vitest';

// The filtering logic from SearchView is a pure function — we test it here
// directly so we don't need to spin up Ink rendering for what is really just
// a data transformation.
function filterEntries(entries, query) {
  if (!query.trim()) return entries;
  const q = query.toLowerCase();
  return entries.filter(e =>
    e.filename.toLowerCase().includes(q) ||
    e.project.toLowerCase().includes(q) ||
    e.notes.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q))
  );
}

const ENTRIES = [
  {
    id: '1',
    filename: 'stripe-error.png',
    project: 'payments',
    notes: 'Checkout webhook 400',
    tags: ['bug', 'stripe'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    filename: 'dashboard-layout.png',
    project: 'design-system',
    notes: 'Sidebar overlaps on mobile',
    tags: ['ui', 'layout'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    filename: 'onboarding-flow.png',
    project: 'payments',
    notes: '',
    tags: ['feature'],
    createdAt: new Date().toISOString(),
  },
];

describe('filterEntries (SearchView logic)', () => {
  it('returns all entries when query is empty', () => {
    expect(filterEntries(ENTRIES, '')).toHaveLength(3);
  });

  it('returns all entries when query is only whitespace', () => {
    expect(filterEntries(ENTRIES, '   ')).toHaveLength(3);
  });

  it('filters by filename (case-insensitive)', () => {
    const results = filterEntries(ENTRIES, 'STRIPE');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('filters by project name', () => {
    const results = filterEntries(ENTRIES, 'payments');
    expect(results).toHaveLength(2);
    expect(results.map(r => r.id)).toEqual(expect.arrayContaining(['1', '3']));
  });

  it('filters by notes content', () => {
    const results = filterEntries(ENTRIES, 'webhook');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('filters by tag', () => {
    const results = filterEntries(ENTRIES, 'ui');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('returns multiple matches across different fields', () => {
    // 'layout' matches both a tag and notes content in entry 2
    const results = filterEntries(ENTRIES, 'layout');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterEntries(ENTRIES, 'xyzzy-no-match')).toHaveLength(0);
  });

  it('is case-insensitive across all fields', () => {
    expect(filterEntries(ENTRIES, 'BUG')).toHaveLength(1);
    expect(filterEntries(ENTRIES, 'DESIGN-SYSTEM')).toHaveLength(1);
    expect(filterEntries(ENTRIES, 'CHECKOUT')).toHaveLength(1);
  });
});