import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import NavBar from './NavBar.jsx';
import BrowserView from '../views/BrowserView.jsx';
import OrganizerView from '../views/OrganizerView.jsx';
import SearchView from '../views/SearchView.jsx';
import { useScreenshots } from '../hooks/useScreenshots.js';

export default function App() {
  const { exit } = useApp();
  const [view, setView] = useState('browser');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [textInputActive, setTextInputActive] = useState(false);
  const { entries, updateEntry } = useScreenshots();

  useInput((input, key) => {
    // Only process global shortcuts when no text input is active
    if (textInputActive) return;
    
    if (input === 'q') exit();
    if (key.tab) {
      const views = ['browser', 'organizer', 'search'];
      setView(v => views[(views.indexOf(v) + 1) % views.length]);
    }
    if (input === '1') setView('browser');
    if (input === '2') setView('organizer');
    if (input === '3') setView('search');
  });

  function handleSelect(entry) {
    setSelectedEntry(entry);
    setView('organizer');
  }

  function handleSave(entry) {
    updateEntry(entry);
    setSelectedEntry(entry);
  }

  return (
    <Box flexDirection="column" height="100%">
      <Box paddingX={1} paddingY={0}>
        <Text bold color="cyan">Screenshot Organizer</Text>
      </Box>
      <NavBar activeView={view} />
      <Box flexGrow={1} flexDirection="column">
        {view === 'browser' && (
          <BrowserView entries={entries} onSelect={handleSelect} />
        )}
        {view === 'organizer' && (
          <OrganizerView
            entry={selectedEntry}
            onSave={handleSave}
            onBack={() => setView('browser')}
            onTextInputActive={setTextInputActive}
          />
        )}
        {view === 'search' && (
          <SearchView 
            entries={entries} 
            onSelect={handleSelect}
            onTextInputActive={setTextInputActive}
          />
        )}
      </Box>
      <Box borderStyle="single" borderTop={true} paddingX={1}>
        <Text color="gray">
          {entries.length} screenshot{entries.length !== 1 ? 's' : ''} indexed
        </Text>
      </Box>
    </Box>
  );
}