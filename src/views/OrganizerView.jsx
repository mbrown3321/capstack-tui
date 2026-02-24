import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import clipboard from 'clipboardy';

const FIELDS = ['project', 'tags', 'notes'];

export default function OrganizerView({ entry, onSave, onBack, onTextInputActive }) {
  const [field, setField] = useState(0);
  const [project, setProject] = useState(entry?.project ?? '');
  const [tags, setTags] = useState(entry?.tags?.join(', ') ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [copied, setCopied] = useState(false);
  const typingTimeoutRef = React.useRef(null);

  // Track if any text input is actively focused
  const [isTyping, setIsTyping] = useState(false); // Start with false - only true when actually typing
  
  // Notify parent when text input is actively being used
  React.useEffect(() => {
    onTextInputActive?.(isTyping);
  }, [isTyping, onTextInputActive]);

  // Handle field changes - don't automatically set typing to true
  const handleFieldChange = (newField) => {
    setField(newField);
    setIsTyping(false); // Reset typing state when switching fields
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle text input - set typing to true when user types
  const handleTextChange = (value, setter) => {
    setter(value);
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to reset typing state after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      setIsTyping(false);
      onBack();
    }
    if (key.tab) {
      handleFieldChange((field + 1) % FIELDS.length);
    }
    if (input === 's' && key.ctrl) {
      onSave({
        ...entry,
        project,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes,
      });
    }
    if (input === 'c') {
      const md = `![${entry.filename}](${entry.path})`;
      clipboard.writeSync(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  });

  if (!entry) {
    return (
      <Box padding={2}>
        <Text color="gray">No screenshot selected. Go to Browser and press Enter.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={2} gap={1}>
      <Box>
        <Text bold color="cyan">{entry.filename}</Text>
        <Text color="gray"> · {entry.path}</Text>
      </Box>

      <Box flexDirection="column" gap={1}>
        <FieldRow
          label="Project"
          active={field === 0}
          value={project}
          onChange={(value) => handleTextChange(value, setProject)}
        />
        <FieldRow
          label="Tags"
          active={field === 1}
          value={tags}
          onChange={(value) => handleTextChange(value, setTags)}
          hint="comma separated"
        />
        <FieldRow
          label="Notes"
          active={field === 2}
          value={notes}
          onChange={(value) => handleTextChange(value, setNotes)}
        />
      </Box>

      <Box gap={2} marginTop={1}>
        <Text color="gray">Tab to switch fields</Text>
        <Text color="green">Ctrl+S to save</Text>
        <Text color="magenta">c to copy markdown</Text>
        <Text color="gray">Esc to go back</Text>
        {copied && <Text color="cyan">✓ Copied to clipboard!</Text>}
      </Box>
    </Box>
  );
}

function FieldRow({ label, active, value, onChange, hint }) {
  return (
    <Box>
      <Text color={active ? 'cyan' : 'gray'} bold={active}>
        {`${label.padEnd(8)}: `}
      </Text>
      {active ? (
        <TextInput value={value} onChange={onChange} />
      ) : (
        <Text>{value || <Text color="gray">{hint ?? '—'}</Text>}</Text>
      )}
      {hint && !active && <Text color="gray"> ({hint})</Text>}
    </Box>
  );
}