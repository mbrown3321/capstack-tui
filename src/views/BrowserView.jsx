import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { formatDistanceToNow } from 'date-fns';

export default function BrowserView({ entries, onSelect }) {
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setCursor(c => Math.max(0, c - 1));
    if (key.downArrow) setCursor(c => Math.min(entries.length - 1, c + 1));
    if (key.return && entries[cursor]) onSelect(entries[cursor]);
  });

  if (entries.length === 0) {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="gray">No screenshots indexed yet.</Text>
        <Text color="gray">Add images to your screenshots folder and they'll appear here.</Text>
      </Box>
    );
  }

  // Group by project
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.project || '(no project)';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="gray" dimColor>↑↓ navigate · Enter to edit</Text>
      <Box height={1} />
      {Object.entries(grouped).map(([project, items]) => (
        <Box key={project} flexDirection="column" marginBottom={1}>
          <Text bold color="yellow">{project}</Text>
          {items.map((entry) => {
            const idx = globalIndex++;
            const isSelected = cursor === idx;
            const age = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
            return (
              <Box key={entry.id} paddingLeft={2}>
                <Text color={isSelected ? 'cyan' : 'white'}>
                  {isSelected ? '▶ ' : '  '}
                  {entry.filename}
                </Text>
                <Text color="gray"> · {age}</Text>
                {entry.tags.length > 0 && (
                  <Text color="magenta"> · {entry.tags.map(t => `#${t}`).join(' ')}</Text>
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}