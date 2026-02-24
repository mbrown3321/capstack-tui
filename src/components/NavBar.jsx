import React from 'react';
import { Box, Text } from 'ink';

const VIEWS = ['browser', 'organizer', 'search'];

export default function NavBar({ activeView }) {
  return (
    <Box borderStyle="single" borderBottom={true} paddingX={1}>
      {VIEWS.map((view, i) => (
        <Box key={view} marginRight={2}>
          <Text
            bold={activeView === view}
            color={activeView === view ? 'cyan' : 'gray'}
          >
            {`[${i + 1}] ${view.charAt(0).toUpperCase() + view.slice(1)}`}
          </Text>
        </Box>
      ))}
      <Box flexGrow={1} />
      <Text color="gray">Tab to switch · q to quit</Text>
    </Box>
  );
}