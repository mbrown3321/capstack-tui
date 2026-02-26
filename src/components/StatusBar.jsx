import React from 'react';
import { Box, Text } from 'ink';
import { inkColors, textStyles } from '../styles/theme.js';
import { formatDistanceToNow } from 'date-fns';

const paneNames = ['PROJECTS', 'SCREENSHOTS', 'ORGANIZER'];

export default function StatusBar({ activePane, selectedEntry, isTyping }) {
  const modeText = isTyping ? 'INSERT' : paneNames[activePane];
  
  return (
    <Box 
      flexDirection="row" 
      alignItems="center"
      borderStyle="single"
      borderTopColor={inkColors.darkGray}
    >
      {/* Mode indicator */}
      <Box 
        paddingX={1}
        backgroundColor={isTyping ? inkColors.yellow : inkColors.green}
      >
        <Text 
          color={isTyping ? inkColors.black : inkColors.black}
          bold
        >
          {modeText}
        </Text>
      </Box>
      
      {/* File info */}
      {selectedEntry && (
        <Box paddingX={1}>
          <Text color={inkColors.cyan}>
            {selectedEntry.project || '(no project)'}
          </Text>
          <Text color={inkColors.muted}>
            {' · '}
            {new Date(selectedEntry.createdAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </Box>
      )}
      
      <Box flexGrow={1} />
      
      {/* Shortcuts */}
      <Box paddingX={1}>
        <Text color={inkColors.dim}>
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>↑↓</Text> navigate{' '}
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>Tab</Text> pane{' '}
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>/</Text> search{' '}
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>1</Text> proj{' '}
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>2</Text> list{' '}
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>3</Text> org{' '}
          <Text backgroundColor={inkColors.black} color={inkColors.dim}>q</Text> quit
        </Text>
      </Box>
    </Box>
  );
}
