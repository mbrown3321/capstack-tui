import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import clipboard from 'clipboardy';

const FIELDS = ['project', 'tags', 'notes'];

function buildMarkdown(s) {
  if (!s) return '';
  const tags = (s.tags || []).map(t => `#${t}`).join(' ');
  return `![${s.project || 'screenshot'}](${s.filename})\n<!-- ${tags} -->\n${s.notes ? `\n${s.notes}` : ''}`;
}

export default function OrganizerPane({ screenshot, active, editingField, onFieldFocus, onSave, onDelete }) {
  const [draft, setDraft] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [fieldIdx, setFieldIdx] = useState(0);

  // Reset draft when screenshot changes
  useEffect(() => {
    if (screenshot) {
      setDraft({
        project: screenshot.project || '',
        tags:    [...(screenshot.tags || [])],
        notes:   screenshot.notes || '',
      });
      setTagInput('');
    }
  }, [screenshot?.id]);

  const isDirty = draft && screenshot && (
    draft.project !== (screenshot.project || '') ||
    draft.notes   !== (screenshot.notes   || '') ||
    JSON.stringify(draft.tags) !== JSON.stringify(screenshot.tags || [])
  );

  useInput((input, key) => {
    if (!active || !screenshot || !draft) return;

    // Tab cycles fields when organizer is active
    if (key.tab && !key.shift && !editingField) {
      setFieldIdx(f => (f + 1) % FIELDS.length);
      onFieldFocus(FIELDS[(fieldIdx + 1) % FIELDS.length]);
      return;
    }
    if (key.tab && key.shift && !editingField) {
      setFieldIdx(f => (f + 2) % FIELDS.length);
      onFieldFocus(FIELDS[(fieldIdx + 2) % FIELDS.length]);
      return;
    }

    // Enter to start editing focused field
    if (key.return && !editingField) {
      onFieldFocus(FIELDS[fieldIdx]);
      return;
    }

    // Ctrl+S saves
    if (input === 's' && key.ctrl) {
      handleSave();
      return;
    }

    // 'c' copies markdown
    if (input === 'c' && !editingField) {
      const md = buildMarkdown(screenshot);
      clipboard.write(md).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return;
    }

    // Delete key removes screenshot
    if ((key.delete || input === 'd') && !editingField) {
      onDelete(screenshot.id);
      return;
    }
  });

  // When adding a tag (Enter in tag input)
  function handleTagSubmit() {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !draft.tags.includes(t)) {
      setDraft(d => ({ ...d, tags: [...d.tags, t] }));
    }
    setTagInput('');
    onFieldFocus(null);
  }

  function removeTag(tag) {
    setDraft(d => ({ ...d, tags: d.tags.filter(t => t !== tag) }));
  }

  function handleSave() {
    if (draft && screenshot) {
      onSave(screenshot.id, draft);
    }
  }

  if (!screenshot || !draft) {
    return (
      <Box
        flexDirection="column"
        width={32}
        borderStyle="single"
        borderColor="gray"
        flexShrink={0}
      >
        <Box paddingX={1}>
          <Text color="gray">✎ Organizer</Text>
        </Box>
        <Box paddingX={2} paddingY={1}>
          <Text color="gray" dimColor>Select a screenshot</Text>
        </Box>
      </Box>
    );
  }

  const isEditing = (field) => editingField === field && active;

  return (
    <Box
      flexDirection="column"
      width={36}
      borderStyle="single"
      borderColor={active ? 'green' : 'gray'}
      flexShrink={0}
      overflow="hidden"
    >
      {/* Header */}
      <Box paddingX={1} borderStyle="single" borderColor={active ? 'green' : 'gray'} flexShrink={0}>
        <Text color={active ? 'green' : 'gray'}>✎ Organizer</Text>
        {isDirty && <Text color="yellow"> ●</Text>}
      </Box>

      <Box flexDirection="column" flexGrow={1} paddingX={1} overflowY="hidden">

        {/* Filename */}
        <Box marginTop={1} marginBottom={1}>
          <Text color="cyan" wrap="truncate">{screenshot.filename}</Text>
        </Box>

        {/* File meta */}
        <Box marginBottom={1}>
          <Text color="gray" dimColor>size  </Text>
          <Text color="white">{screenshot.size ? `${Math.round(screenshot.size/1024)} KB` : '—'}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text color="gray" dimColor>added </Text>
          <Text color="white">
            {new Date(screenshot.createdAt).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </Box>

        {/* Divider */}
        <Text color="gray" dimColor>{'─'.repeat(30)}</Text>

        {/* ── Project field ── */}
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text color={fieldIdx === 0 && active ? 'cyan' : 'gray'}>
              {fieldIdx === 0 && active ? '▶ ' : '  '}
            </Text>
            <Text color={fieldIdx === 0 && active ? 'cyan' : 'gray'}>project</Text>
          </Box>
          <Box paddingLeft={2} borderStyle="single" borderColor={isEditing('project') ? 'cyan' : 'gray'}>
            {isEditing('project') ? (
              <TextInput
                value={draft.project}
                onChange={v => setDraft(d => ({ ...d, project: v }))}
                onSubmit={() => onFieldFocus(null)}
              />
            ) : (
              <Text color={draft.project ? 'white' : 'gray'} dimColor={!draft.project}>
                {draft.project || '(none)'}
              </Text>
            )}
          </Box>
        </Box>

        {/* ── Tags field ── */}
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text color={fieldIdx === 1 && active ? 'cyan' : 'gray'}>
              {fieldIdx === 1 && active ? '▶ ' : '  '}
            </Text>
            <Text color={fieldIdx === 1 && active ? 'cyan' : 'gray'}>tags</Text>
          </Box>
          <Box paddingLeft={2} borderStyle="single" borderColor={isEditing('tags') ? 'cyan' : 'gray'} flexWrap="wrap">
            {draft.tags.map(t => (
              <Text key={t} color="green"> [{t}]</Text>
            ))}
            {isEditing('tags') && (
              <Box>
                <Text color="gray">+</Text>
                <TextInput
                  value={tagInput}
                  onChange={setTagInput}
                  placeholder="add tag"
                  onSubmit={handleTagSubmit}
                />
              </Box>
            )}
          </Box>
          {isEditing('tags') && (
            <Box paddingLeft={2}>
              <Text color="gray" dimColor>Enter to add · Backspace to remove last</Text>
            </Box>
          )}
        </Box>

        {/* ── Notes field ── */}
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text color={fieldIdx === 2 && active ? 'cyan' : 'gray'}>
              {fieldIdx === 2 && active ? '▶ ' : '  '}
            </Text>
            <Text color={fieldIdx === 2 && active ? 'cyan' : 'gray'}>notes</Text>
          </Box>
          <Box paddingLeft={2} borderStyle="single" borderColor={isEditing('notes') ? 'cyan' : 'gray'}>
            {isEditing('notes') ? (
              <TextInput
                value={draft.notes}
                onChange={v => setDraft(d => ({ ...d, notes: v }))}
                onSubmit={() => onFieldFocus(null)}
              />
            ) : (
              <Text color={draft.notes ? 'white' : 'gray'} dimColor={!draft.notes} wrap="wrap">
                {draft.notes || '(no notes)'}
              </Text>
            )}
          </Box>
        </Box>

        {/* Markdown preview */}
        <Box marginTop={1} flexDirection="column">
          <Text color="gray" dimColor>markdown snippet</Text>
          <Box borderStyle="single" borderColor="gray" paddingX={1}>
            <Text color="gray" wrap="truncate">
              ![{screenshot.project || 'img'}]({screenshot.filename?.slice(0, 20)}…)
            </Text>
          </Box>
        </Box>

      </Box>

      {/* Action bar */}
      <Box borderStyle="single" borderColor="gray" flexShrink={0}>
        <Box flexGrow={1} justifyContent="center">
          <Text color={isDirty ? 'green' : 'gray'}>[^S] Save</Text>
        </Box>
        <Box flexGrow={1} justifyContent="center">
          <Text color={copied ? 'green' : 'cyan'}>{copied ? '✓ Copied!' : '[c] Copy MD'}</Text>
        </Box>
        <Box flexGrow={1} justifyContent="center">
          <Text color="red">[d] Delete</Text>
        </Box>
      </Box>
    </Box>
  );
}