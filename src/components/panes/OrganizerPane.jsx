import React, { useState, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import clipboard from 'clipboardy';
import { inkColors, textStyles } from '../../styles/theme.js';
import { formatDistanceToNow, format } from 'date-fns';

export default function OrganizerPane({ entry, onSave, isActive, onTypingChange }) {
  const [field, setField] = useState(0); // 0: project, 1: tags, 2: notes
  const [project, setProject] = useState(entry?.project ?? '');
  const [tags, setTags] = useState(entry?.tags?.join(', ') ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [copied, setCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const FIELDS = ['project', 'tags', 'notes'];

  // Notify parent of typing state
  React.useEffect(() => {
    onTypingChange?.(isTyping);
  }, [isTyping, onTypingChange]);

  // Handle text input with timeout
  const handleTextChange = (value, setter) => {
    setter(value);
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Cleanup timeout
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useInput((input, key) => {
    if (!isActive) return;
    
    if (key.tab) {
      const nextField = (field + 1) % FIELDS.length;
      setField(nextField);
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
      const md = `![${entry?.project || 'screenshot'}](${entry?.path})`;
      clipboard.writeSync(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!entry) {
    return (
      <Box flexDirection="column">
        {/* Header - compact */}
        <Box 
          flexDirection="row" 
          alignItems="center"
          paddingX={1}
          borderBottomColor={inkColors.border}
          borderStyle="single"
        >
          <Text color={inkColors.muted} marginRight={1}>
            ✎
          </Text>
          <Text color={inkColors.muted}>
            Organizer
          </Text>
        </Box>

        {/* Empty State */}
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text color={inkColors.muted}>
            Select to edit
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header - compact */}
      <Box 
        flexDirection="row" 
        alignItems="center"
        paddingX={1}
        backgroundColor={isActive ? inkColors.black : undefined}
        borderBottomColor={isActive ? inkColors.green : inkColors.border}
        borderStyle="single"
      >
        <Text color={isActive ? inkColors.green : inkColors.muted} marginRight={1}>
          ✎
        </Text>
        <Text color={isActive ? inkColors.green : inkColors.muted}>
          Organizer
        </Text>
      </Box>

      {/* Content - ultra compact */}
      <Box flexDirection="column" flexGrow={1}>
        {/* Preview Area - tiny */}
        <Box 
          marginX={1}
          height={3}
          borderStyle="single"
          borderColor={inkColors.border}
          justifyContent="center"
          alignItems="center"
        >
          <Text color={inkColors.muted} fontSize={10}>
            🖼 no preview
          </Text>
        </Box>

        {/* File Details - compact */}
        <Box marginX={1} marginTop={1}>
          <Text color={inkColors.cyan} fontSize={9}>
            {entry.filename.length > 20 ? entry.filename.slice(0, 20) + '…' : entry.filename}
          </Text>
          <Box flexDirection="row" gap={1}>
            <Text color={inkColors.muted} fontSize={9}>{formatFileSize(entry.size)}</Text>
            <Text color={inkColors.muted} fontSize={9}>{format(new Date(entry.createdAt), 'MMM d HH:mm')}</Text>
          </Box>
        </Box>

        {/* Edit Metadata - compact */}
        <Box marginX={1} marginTop={1}>
          {/* Project Field */}
          <Box 
            borderStyle="single" 
            borderColor={field === 0 ? inkColors.cyan : inkColors.border}
          >
            <Box 
              backgroundColor={inkColors.black}
              borderStyle="single"
              borderBottomColor={field === 0 ? inkColors.cyan : inkColors.border}
              paddingX={1}
            >
              <Text color={field === 0 ? inkColors.cyan : inkColors.muted} fontSize={9}>
                Project
              </Text>
            </Box>
            <Box paddingX={1} paddingY={0}>
              {field === 0 ? (
                <TextInput 
                  value={project} 
                  onChange={(value) => handleTextChange(value, setProject)}
                />
              ) : (
                <Text color={inkColors.textHi} fontSize={9}>{project || <Text color={inkColors.muted}>—</Text>}</Text>
              )}
            </Box>
          </Box>

          {/* Tags Field */}
          <Box 
            borderStyle="single" 
            borderColor={field === 1 ? inkColors.cyan : inkColors.border}
            marginTop={1}
          >
            <Box 
              backgroundColor={inkColors.black}
              borderStyle="single"
              borderBottomColor={field === 1 ? inkColors.cyan : inkColors.border}
              paddingX={1}
            >
              <Text color={field === 1 ? inkColors.cyan : inkColors.muted} fontSize={9}>
                Tags
              </Text>
            </Box>
            <Box paddingX={1} paddingY={0}>
              {field === 1 ? (
                <TextInput 
                  value={tags} 
                  onChange={(value) => handleTextChange(value, setTags)}
                  placeholder="+tag"
                />
              ) : (
                <Box flexDirection="row" gap={1} flexWrap="wrap">
                  {entry.tags.map(tag => (
                    <Text 
                      key={tag}
                      backgroundColor={inkColors.black}
                      color={inkColors.green}
                      fontSize={9}
                    >
                      #{tag}
                    </Text>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Notes Field */}
          <Box 
            borderStyle="single" 
            borderColor={field === 2 ? inkColors.cyan : inkColors.border}
            marginTop={1}
          >
            <Box 
              backgroundColor={inkColors.black}
              borderStyle="single"
              borderBottomColor={field === 2 ? inkColors.cyan : inkColors.border}
              paddingX={1}
            >
              <Text color={field === 2 ? inkColors.cyan : inkColors.muted} fontSize={9}>
                Notes
              </Text>
            </Box>
            <Box paddingX={1} paddingY={0}>
              {field === 2 ? (
                <TextInput 
                  value={notes} 
                  onChange={(value) => handleTextChange(value, setNotes)}
                />
              ) : (
                <Text color={inkColors.text} fontSize={9}>{notes || <Text color={inkColors.muted}>—</Text>}</Text>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Action Bar */}
      <Box 
        flexDirection="row" 
        borderTopColor={inkColors.darkGray}
        borderTopStyle="single"
      >
        <Box 
          flexGrow={1} 
          justifyContent="center" 
          alignItems="center"
          paddingY={1}
          borderRightColor={inkColors.darkGray}
          borderRightStyle="single"
        >
          <Text color={inkColors.green}>
            <Text backgroundColor={inkColors.black} color={inkColors.greenDim}>^S</Text> Save
          </Text>
        </Box>
        <Box 
          flexGrow={1} 
          justifyContent="center" 
          alignItems="center"
          paddingY={1}
          borderRightColor={inkColors.darkGray}
          borderRightStyle="single"
        >
          <Text color={inkColors.cyan}>
            <Text backgroundColor={inkColors.black} color={inkColors.dim}>c</Text> Copy MD
          </Text>
        </Box>
        <Box 
          flexGrow={1} 
          justifyContent="center" 
          alignItems="center"
          paddingY={1}
        >
          <Text color={inkColors.muted}>
            <Text backgroundColor={inkColors.black} color={inkColors.dim}>Del</Text> Remove
          </Text>
        </Box>
        {copied && (
          <Box position="absolute" paddingX={2}>
            <Text color={inkColors.cyan}>✓ Copied to clipboard!</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
