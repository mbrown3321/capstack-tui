import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { formatDistanceToNow } from 'date-fns';

export default function SearchView({ entries, onSelect, onTextInputActive }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef(null);

  // Notify parent when text input is actively being used
  React.useEffect(() => {
    onTextInputActive?.(isTyping);
  }, [isTyping, onTextInputActive]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter(e =>
      e.filename.toLowerCase().includes(q) ||
      e.project.toLowerCase().includes(q) ||
      e.notes.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [query, entries]);

  useInput((input, key) => {
    if (key.upArrow) {
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setCursor(c => Math.max(0, c - 1));
    }
    if (key.downArrow) {
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setCursor(c => Math.min(results.length - 1, c + 1));
    }
    if (key.return && results[cursor]) {
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onSelect(results[cursor]);
    }
  });

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <Box>
        <Text color="cyan" bold>Search: </Text>
        <TextInput
          value={query}
          onChange={(val) => { 
            setQuery(val); 
            setCursor(0); 
            setIsTyping(true);
            
            // Clear existing timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            // Set timeout to reset typing state after 1 second of inactivity
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 1000);
          }}
          placeholder="type to filter by name, tag, project, or notes…"
        />
      </Box>

      <Text color="gray">{results.length} result{results.length !== 1 ? 's' : ''}</Text>

      <Box flexDirection="column">
        {results.map((entry, i) => {
          const isSelected = cursor === i;
          const age = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
          return (
            <Box key={entry.id} flexDirection="column" paddingLeft={1}>
              <Box>
                <Text color={isSelected ? 'cyan' : 'white'}>
                  {isSelected ? '▶ ' : '  '}
                  {entry.filename}
                </Text>
                <Text color="gray"> · {age}</Text>
                {entry.project && <Text color="yellow"> · {entry.project}</Text>}
              </Box>
              {(entry.tags.length > 0 || entry.notes) && (
                <Box paddingLeft={4}>
                  {entry.tags.length > 0 && (
                    <Text color="magenta">{entry.tags.map(t => `#${t}`).join(' ')} </Text>
                  )}
                  {entry.notes && <Text color="gray">{entry.notes.slice(0, 60)}{entry.notes.length > 60 ? '…' : ''}</Text>}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Text color="gray">↑↓ navigate · Enter to edit</Text>
    </Box>
  );
}