import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

function buildSections(screenshots) {
  const projects = {};
  const tags = {};
  for (const s of screenshots) {
    if (s.project) projects[s.project] = (projects[s.project] || 0) + 1;
    for (const t of (s.tags || [])) tags[t] = (tags[t] || 0) + 1;
  }

  const todayCutoff = new Date().setHours(0, 0, 0, 0);
  const yesterdayCutoff = todayCutoff - 86400000;
  const todayCount = screenshots.filter(s => new Date(s.createdAt) >= todayCutoff).length;
  const yestCount  = screenshots.filter(s => {
    const t = new Date(s.createdAt).getTime();
    return t >= yesterdayCutoff && t < todayCutoff;
  }).length;

  const items = [
    { label: 'All', sel: { type: 'all' }, count: screenshots.length, prefix: '≡' },
    { _section: 'Projects' },
    ...Object.entries(projects).sort().map(([name, count]) => ({
      label: name, sel: { type: 'project', value: name }, count, prefix: '▸'
    })),
    { label: '(unassigned)', sel: { type: 'project', value: '' }, count: screenshots.filter(s => !s.project).length, prefix: '▹', dim: true },
    { _section: 'Tags' },
    ...Object.entries(tags).sort().map(([name, count]) => ({
      label: name, sel: { type: 'tag', value: name }, count, prefix: '#'
    })),
    { _section: 'Recent' },
    { label: 'Today',     sel: { type: 'recent', value: 'today' },     count: todayCount, prefix: '◷' },
    { label: 'Yesterday', sel: { type: 'recent', value: 'yesterday' }, count: yestCount,  prefix: '◷' },
  ];
  return items;
}

function isSameSel(a, b) {
  return a.type === b.type && a.value === b.value;
}

export default function SidebarPane({ screenshots, selection, onSelect, active }) {
  const items = buildSections(screenshots);
  // selectable items only (no section headers)
  const selectables = items.filter(i => !i._section);

  // find cursor index matching current selection
  const [cursor, setCursor] = useState(() =>
    Math.max(0, selectables.findIndex(i => isSameSel(i.sel, selection)))
  );

  useInput((input, key) => {
    if (!active) return;
    if (key.upArrow) {
      setCursor(c => {
        const next = Math.max(0, c - 1);
        onSelect(selectables[next].sel);
        return next;
      });
    }
    if (key.downArrow) {
      setCursor(c => {
        const next = Math.min(selectables.length - 1, c + 1);
        onSelect(selectables[next].sel);
        return next;
      });
    }
    if (key.return) {
      onSelect(selectables[cursor].sel);
    }
  });

  // build flat render list — items + section headers
  let selectableIdx = -1;
  return (
    <Box
      flexDirection="column"
      width={22}
      borderStyle="single"
      borderColor={active ? 'green' : 'gray'}
      flexShrink={0}
      overflow="hidden"
    >
      {/* Header */}
      <Box paddingX={1} borderStyle="single" borderColor={active ? 'green' : 'gray'} flexShrink={0}>
        <Text color={active ? 'green' : 'gray'}>◈ Projects &amp; Tags</Text>
      </Box>

      {/* Items */}
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        {items.map((item, i) => {
          if (item._section) {
            return (
              <Box key={i} paddingX={1} marginTop={1}>
                <Text color="gray" dimColor>{item._section.toUpperCase()}</Text>
              </Box>
            );
          }
          selectableIdx++;
          const idx = selectableIdx;
          const isSelected = active && cursor === idx;
          const isActive = isSameSel(item.sel, selection);

          return (
            <Box key={i} paddingX={1}>
              <Text
                color={isSelected ? 'green' : isActive ? 'white' : item.dim ? 'gray' : 'white'}
                dimColor={item.dim && !isSelected && !isActive}
              >
                {isSelected ? '▶ ' : '  '}
                <Text color={isSelected ? 'green' : 'gray'}>{item.prefix} </Text>
                {item.label}
              </Text>
              <Box flexGrow={1} />
              <Text color={isSelected ? 'green' : 'gray'} dimColor={!isSelected}>
                {item.count}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}