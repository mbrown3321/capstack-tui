import React, { useState, useCallback } from 'react';
import { Box, useInput, useApp, Text } from 'ink';
import useScreenshots from '../hooks/useScreenshots.js';
import SidebarPane from '../views/SidebarPane.js';
import ListPane from '../views/ListPane.js';
import OrganizerPane from '../views/OrganizerPane.js';
import StatusBar from './StatusBar.js';
import SearchBar from './SearchBar.js';

// Pane indices
const PANE_SIDEBAR   = 0;
const PANE_LIST      = 1;
const PANE_ORGANIZER = 2;

export default function App() {
  const { exit } = useApp();
  const { screenshots, updateScreenshot, deleteScreenshot } = useScreenshots();

  // ── UI state ────────────────────────────────────────────
  const [activePane, setActivePane]     = useState(PANE_LIST);
  const [sidebarSel, setSidebarSel]     = useState({ type: 'all' }); // {type:'project'|'tag'|'recent'|'all', value}
  const [listIndex, setListIndex]       = useState(0);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [editingField, setEditingField] = useState(null); // null | 'project' | 'tags' | 'notes'

  // ── Derived data ─────────────────────────────────────────
  const filteredScreenshots = React.useMemo(() => {
    let list = screenshots;

    // sidebar filter
    if (sidebarSel.type === 'project') {
      list = list.filter(s => s.project === sidebarSel.value);
    } else if (sidebarSel.type === 'tag') {
      list = list.filter(s => (s.tags || []).includes(sidebarSel.value));
    } else if (sidebarSel.type === 'recent') {
      const cutoff = sidebarSel.value === 'today'
        ? new Date().setHours(0, 0, 0, 0)
        : Date.now() - 2 * 86400000;
      list = list.filter(s => new Date(s.createdAt).getTime() >= cutoff);
    }

    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.filename?.toLowerCase().includes(q) ||
        s.project?.toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q)) ||
        s.notes?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [screenshots, sidebarSel, searchQuery]);

  const safeIndex = Math.min(listIndex, Math.max(0, filteredScreenshots.length - 1));
  const selected  = filteredScreenshots[safeIndex] ?? null;

  // ── Global keybindings ───────────────────────────────────
  useInput((input, key) => {
    // quit
    if (input === 'q' && !editingField && !searchFocused) { exit(); return; }

    // search bar toggle
    if (input === '/' && !searchFocused && !editingField) {
      setSearchFocused(true);
      return;
    }
    if (key.escape) {
      if (searchFocused) { setSearchFocused(false); return; }
      if (editingField)  { setEditingField(null);   return; }
    }

    // pane switching with number keys
    if (!searchFocused && !editingField) {
      if (input === '1') { setActivePane(PANE_SIDEBAR);   return; }
      if (input === '2') { setActivePane(PANE_LIST);      return; }
      if (input === '3') { setActivePane(PANE_ORGANIZER); return; }

      // Tab cycles panes forward
      if (key.tab && !key.shift) {
        setActivePane(p => (p + 1) % 3);
        return;
      }
      if (key.tab && key.shift) {
        setActivePane(p => (p + 2) % 3);
        return;
      }
    }

    // arrow navigation in list pane
    if (activePane === PANE_LIST && !editingField && !searchFocused) {
      if (key.upArrow) {
        setListIndex(i => Math.max(0, i - 1));
        return;
      }
      if (key.downArrow) {
        setListIndex(i => Math.min(filteredScreenshots.length - 1, i + 1));
        return;
      }
      // Enter jumps to organizer and focuses first field
      if (key.return) {
        setActivePane(PANE_ORGANIZER);
        setEditingField('project');
        return;
      }
    }
  });

  const handleSidebarSelect = useCallback((sel) => {
    setSidebarSel(sel);
    setListIndex(0);
    setActivePane(PANE_LIST);
  }, []);

  const handleSave = useCallback((id, patch) => {
    updateScreenshot(id, patch);
    setEditingField(null);
  }, [updateScreenshot]);

  const handleDelete = useCallback((id) => {
    deleteScreenshot(id);
    setListIndex(i => Math.max(0, i - 1));
  }, [deleteScreenshot]);

  return (
    <Box flexDirection="column" height="100%">
      {/* Title bar */}
      <Box borderStyle="single" borderColor="green" paddingX={1}>
        <Box flexGrow={1}>
          <Box><Text color="green" bold>📸 capstack</Text></Box>
        </Box>
        <Box>
          <Text color="gray">watching </Text>
          <Text color="cyan">~/Desktop</Text>
          <Text color="gray"> · </Text>
          <Text color="cyan">{screenshots.length}</Text>
          <Text color="gray"> screenshots</Text>
        </Box>
      </Box>

      {/* Search bar — always visible */}
      <SearchBar
        query={searchQuery}
        onChange={setSearchQuery}
        focused={searchFocused}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        resultCount={filteredScreenshots.length}
      />

      {/* Three-pane area */}
      <Box flexGrow={1}>
        <SidebarPane
          screenshots={screenshots}
          selection={sidebarSel}
          onSelect={handleSidebarSelect}
          active={activePane === PANE_SIDEBAR}
        />
        <ListPane
          screenshots={filteredScreenshots}
          selectedIndex={safeIndex}
          onSelect={setListIndex}
          active={activePane === PANE_LIST}
        />
        <OrganizerPane
          screenshot={selected}
          active={activePane === PANE_ORGANIZER}
          editingField={editingField}
          onFieldFocus={setEditingField}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </Box>

      {/* Status bar */}
      <StatusBar
        activePane={activePane}
        selected={selected}
        editingField={editingField}
      />
    </Box>
  );
}