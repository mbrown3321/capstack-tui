import { describe, it, expect } from 'vitest';

// Pure logic extracted from OrganizerView — tested without needing Ink rendering.

// Tag parsing: the organizer splits a comma-separated string into a tags array
function parseTags(tagString) {
  return tagString.split(',').map(t => t.trim()).filter(Boolean);
}

// Markdown snippet generation
function toMarkdownSnippet(entry) {
  return `![${entry.filename}](${entry.path})`;
}

// ---------------------------------------------------------------------------
// parseTags
// ---------------------------------------------------------------------------
describe('parseTags (OrganizerView tag input)', () => {
  it('splits a simple comma-separated string', () => {
    expect(parseTags('bug, ui, stripe')).toEqual(['bug', 'ui', 'stripe']);
  });

  it('trims whitespace around each tag', () => {
    expect(parseTags('  bug  ,  ui  ')).toEqual(['bug', 'ui']);
  });

  it('filters out empty segments from double commas', () => {
    expect(parseTags('bug,,ui')).toEqual(['bug', 'ui']);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('returns an empty array for a whitespace-only string', () => {
    expect(parseTags('   ')).toEqual([]);
  });

  it('handles a single tag with no commas', () => {
    expect(parseTags('bug')).toEqual(['bug']);
  });

  it('handles trailing commas gracefully', () => {
    expect(parseTags('bug, ui,')).toEqual(['bug', 'ui']);
  });
});

// ---------------------------------------------------------------------------
// toMarkdownSnippet
// ---------------------------------------------------------------------------
describe('toMarkdownSnippet (OrganizerView clipboard copy)', () => {
  it('produces a valid markdown image snippet', () => {
    const entry = { filename: 'error.png', path: '/Users/matt/Screenshots/error.png' };
    expect(toMarkdownSnippet(entry)).toBe('![error.png](/Users/matt/Screenshots/error.png)');
  });

  it('uses the filename as the alt text', () => {
    const entry = { filename: 'my-screenshot.png', path: '/tmp/my-screenshot.png' };
    const snippet = toMarkdownSnippet(entry);
    expect(snippet).toMatch(/^!\[my-screenshot\.png\]/);
  });

  it('uses the full path as the image src', () => {
    const entry = { filename: 'x.png', path: '/deep/nested/path/x.png' };
    const snippet = toMarkdownSnippet(entry);
    expect(snippet).toContain('(/deep/nested/path/x.png)');
  });

  it('handles filenames with spaces', () => {
    const entry = { filename: 'my screenshot.png', path: '/tmp/my screenshot.png' };
    expect(toMarkdownSnippet(entry)).toBe('![my screenshot.png](/tmp/my screenshot.png)');
  });
});