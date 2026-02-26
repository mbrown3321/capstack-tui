import React, { useRef, useEffect } from 'react';
import { Box, Text } from 'ink';

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (day.getTime() === today.getTime()) return 'Today';
  if (day.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function groupByDate(screenshots) {
  const groups = [];
  let lastLabel = null;
  for (const s of screenshots) {
    const label = formatDate(s.createdAt);
    if (label !== lastLabel) {
      groups.push({ type: 'header', label });
      lastLabel = label;
    }
    groups.push({ type: 'item', screenshot: s });
  }
  return groups;
}

// Tag color based on name (simple hash)
function tagColor(tag) {
  const colors = ['green', 'cyan', 'yellow', 'magenta'];
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

export default function ListPane({ screenshots, selectedIndex, onSelect, active }) {
  // build flat row list mapping row index -> screenshot index
  const rows = groupByDate(screenshots);

  // Map from screenshot index to flat row index for scrolling
  let ssIdx = -1;
  const rowToSsIdx = rows.map(r => {
    if (r.type === 'item') { ssIdx++; return ssIdx; }
    return -1;
  });

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle="single"
      borderColor={active ? 'cyan' : 'gray'}
      overflow="hidden"
    >
      {/* Header */}
      <Box paddingX={1} borderStyle="single" borderColor={active ? 'cyan' : 'gray'} flexShrink={0}>
        <Text color={active ? 'cyan' : 'gray'}>≡ Screenshots</Text>
        <Box flexGrow={1} />
        <Text color="gray">{screenshots.length}</Text>
      </Box>

      {screenshots.length === 0 && (
        <Box paddingX={2} paddingY={1}>
          <Text color="gray" dimColor>No screenshots match.</Text>
        </Box>
      )}

      {/* List — Ink doesn't support true virtual scroll, so we slice a window */}
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        {rows.map((row, i) => {
          if (row.type === 'header') {
            return (
              <Box key={i} paddingX={1} marginTop={1}>
                <Text color="gray" dimColor>• {row.label.toUpperCase()}</Text>
              </Box>
            );
          }

          const idx = rowToSsIdx[i];
          const s = row.screenshot;
          const isSelected = idx === selectedIndex;

          return (
            <Box
              key={i}
              flexDirection="column"
              paddingX={1}
              borderStyle={isSelected ? 'single' : undefined}
              borderColor={isSelected ? 'cyan' : undefined}
            >
              {/* Filename */}
              <Text
                color={isSelected ? 'cyan' : 'white'}
                bold={isSelected}
                wrap="truncate"
              >
                {isSelected ? '▶ ' : '  '}{s.filename}
              </Text>

              {/* Meta row */}
              <Box paddingLeft={2}>
                <Text color="gray" dimColor>{formatSize(s.size)}</Text>
                <Text color="gray" dimColor>  {formatTime(s.createdAt)}</Text>
                {(s.tags || []).map(t => (
                  <Text key={t} color={tagColor(t)}> [{t}]</Text>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}