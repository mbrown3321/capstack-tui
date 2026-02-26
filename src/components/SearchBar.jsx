import React from 'react';
import { Box, Text } from 'ink';

const PANE_NAMES = ['SIDEBAR', 'LIST', 'ORGANIZER'];

function Key({ children }) {
  return <Text color="gray">[<Text color="white">{children}</Text>]</Text>;
}

export default function StatusBar({ activePane, selected, editingField }) {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} flexShrink={0}>
      {/* Mode badge */}
      <Box marginRight={2}>
        <Text backgroundColor="green" color="black" bold> {PANE_NAMES[activePane]} </Text>
      </Box>

      {selected && (
        <Box marginRight={2}>
          <Text color="cyan">{selected.project || '(unassigned)'}</Text>
          <Text color="gray"> · </Text>
          <Text color="gray">{selected.filename?.slice(-20)}</Text>
        </Box>
      )}

      {/* Context-sensitive hints */}
      {!editingField && (
        <>
          <Key>↑↓</Key><Text color="gray"> nav  </Text>
          <Key>Tab</Key><Text color="gray"> pane  </Text>
          <Key>/</Key><Text color="gray"> search  </Text>
          <Key>1</Key><Text color="gray">/<Key>2</Key>/<Key>3</Key> panes  </Text>
        </>
      )}
      {editingField && (
        <>
          <Key>Tab</Key><Text color="gray"> next field  </Text>
          <Key>^S</Key><Text color="gray"> save  </Text>
          <Key>Esc</Key><Text color="gray"> cancel  </Text>
        </>
      )}

      <Box flexGrow={1} />
      <Key>q</Key><Text color="gray"> quit</Text>
    </Box>
  );
}