import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { inkColors, textStyles } from '../../styles/theme.js';
import { formatDistanceToNow, format } from 'date-fns';

export default function ScreenshotsPane({ 
  entries, 
  selectedEntry, 
  onSelect, 
  selectedProject, 
  searchQuery, 
  isActive 
}) {
  const [cursor, setCursor] = useState(0);

  // Filter and group entries
  const { groupedItems, flatItems } = useMemo(() => {
    let filtered = entries;

    // Filter by project
    if (selectedProject && selectedProject !== '(unassigned)') {
      filtered = filtered.filter(e => e.project === selectedProject);
    } else if (selectedProject === '(unassigned)') {
      filtered = filtered.filter(e => !e.project || e.project === '');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.filename.toLowerCase().includes(q) ||
        e.project.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Group by date
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      let groupKey;
      
      if (entryDate >= today) {
        groupKey = 'Today';
      } else if (entryDate >= yesterday && entryDate < today) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(entryDate, 'MMM d');
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entry);
    });

    // Create flat list for navigation
    const flat = [];
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      // Sort by date (most recent first)
      const dateA = a === 'Today' ? today : a === 'Yesterday' ? yesterday : new Date(a);
      const dateB = b === 'Today' ? today : b === 'Yesterday' ? yesterday : new Date(b);
      return dateB - dateA;
    });

    sortedGroups.forEach(([groupKey, groupEntries]) => {
      flat.push({ type: 'header', label: groupKey });
      groupEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      groupEntries.forEach(entry => {
        flat.push({ type: 'entry', entry });
      });
    });

    return { groupedItems: groups, flatItems: flat };
  }, [entries, selectedProject, searchQuery]);

  useInput((input, key) => {
    if (!isActive) return;
    
    if (key.upArrow) {
      setCursor(prev => {
        let next = prev - 1;
        // Skip headers
        while (next >= 0 && flatItems[next]?.type === 'header') {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    }
    if (key.downArrow) {
      setCursor(prev => {
        let next = prev + 1;
        // Skip headers
        while (next < flatItems.length && flatItems[next]?.type === 'header') {
          next++;
        }
        return next < flatItems.length ? next : prev;
      });
    }
    if (key.return && flatItems[cursor]?.type === 'entry') {
      onSelect(flatItems[cursor].entry);
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderEntry = (item, index) => {
    if (item.type === 'header') {
      const date = new Date();
      if (item.label === 'Today') {
        date.setHours(0, 0, 0, 0);
      } else if (item.label === 'Yesterday') {
        date.setDate(date.getDate() - 1);
        date.setHours(0, 0, 0, 0);
      }
      
      return (
        <Box key={item.label} paddingY={1}>
          <Box flexDirection="row" alignItems="center">
            <Text color={inkColors.greenDim}>●</Text>
            <Text color={inkColors.muted} marginLeft={1}>
              {item.label} — {format(date, 'MMM d')}
            </Text>
          </Box>
        </Box>
      );
    }

    const entry = item.entry;
    const isSelected = index === cursor;
    const isActiveEntry = selectedEntry?.id === entry.id;
    const fileSize = entry.size ? formatFileSize(entry.size) : 'Unknown';

    return (
      <Box key={entry.id}>
        <Box
          paddingX={1}
          paddingY={1}
          flexDirection="column"
          backgroundColor={isSelected ? inkColors.black : undefined}
        >
          {/* Filename */}
          <Text 
            color={isActiveEntry ? inkColors.cyan : inkColors.textHi}
            bold={isActiveEntry}
          >
            {isSelected ? '▶ ' : '  '}{entry.filename}
          </Text>

          {/* Metadata */}
          <Box flexDirection="row" gap={2} marginTop={1}>
            <Text color={inkColors.muted} fontSize={10}>
              {fileSize}
            </Text>
            <Text color={inkColors.muted} fontSize={10}>
              {format(new Date(entry.createdAt), 'HH:mm')}
            </Text>
          </Box>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <Box flexDirection="row" gap={1} marginTop={1} flexWrap="wrap">
              {entry.tags.map(tag => (
                <Text 
                  key={tag}
                  backgroundColor={inkColors.black}
                  color={inkColors.green}
                  fontSize={10}
                >
                  #{tag}
                </Text>
              ))}
            </Box>
          )}
        </Box>
        {isActiveEntry && (
          <Box height={1}>
            <Text color={inkColors.cyan}>▪</Text>
          </Box>
        )}
      </Box>
    );
  };

  const getHeaderTitle = () => {
    if (selectedProject) {
      const count = flatItems.filter(item => item.type === 'entry').length;
      return `${selectedProject} · ${count} shot${count !== 1 ? 's' : ''}`;
    }
    return `All Screenshots · ${flatItems.filter(item => item.type === 'entry').length} shot${flatItems.filter(item => item.type === 'entry').length !== 1 ? 's' : ''}`;
  };

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
          ≡
        </Text>
        <Text color={isActive ? inkColors.green : inkColors.muted}>
          {getHeaderTitle()}
        </Text>
      </Box>

      {/* Screenshot List - compact */}
      <Box flexDirection="column" flexGrow={1}>
        {flatItems.length === 0 ? (
          <Box padding={1}>
            <Text color={inkColors.muted}>No screenshots</Text>
          </Box>
        ) : (
          flatItems.map((item, index) => renderEntry(item, index))
        )}
      </Box>
    </Box>
  );
}
