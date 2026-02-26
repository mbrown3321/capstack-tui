import React from 'react';
import { Box, Text } from 'ink';
import { inkColors, textStyles } from '../styles/theme.js';

export default function TitleBar({ entries }) {
  return (
    <Box 
      flexDirection="row" 
      justifyContent="space-between" 
      paddingX={1} 
      paddingY={0}
      borderStyle="single"
      borderBottomColor={inkColors.darkGray}
    >
      <Box>
        <Text {...textStyles.title}>
          📸 cap<Text color={inkColors.muted}>stack</Text>
        </Text>
      </Box>
      <Box>
        <Text color={inkColors.muted}>
          watching <Text color={inkColors.cyan}>~/Desktop</Text> ·{' '}
          <Text color={inkColors.cyan} bold>{entries.length}</Text> screenshots
        </Text>
      </Box>
    </Box>
  );
}
