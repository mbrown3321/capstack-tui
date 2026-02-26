import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { inkColors, textStyles } from '../../styles/theme.js';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsPane({ entries, selectedProject, onSelect, isActive }) {
  const [cursor, setCursor] = useState(0);

  // Group entries by project and tags
  const { projects, tags, recent } = useMemo(() => {
    const projectCounts = {};
    const tagCounts = {};
    const recentCounts = { today: 0, yesterday: 0 };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    entries.forEach(entry => {
      // Count projects
      const project = entry.project || '(unassigned)';
      projectCounts[project] = (projectCounts[project] || 0) + 1;

      // Count tags
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Count recent
      const entryDate = new Date(entry.createdAt);
      if (entryDate >= today) {
        recentCounts.today++;
      } else if (entryDate >= yesterday && entryDate < today) {
        recentCounts.yesterday++;
      }
    });

    return {
      projects: Object.entries(projectCounts).sort(([a], [b]) => {
        if (a === '(unassigned)') return 1;
        if (b === '(unassigned)') return -1;
        return a.localeCompare(b);
      }),
      tags: Object.entries(tagCounts).sort(([a], [b]) => a.localeCompare(b)),
      recent: [
        ['Today', recentCounts.today],
        ['Yesterday', recentCounts.yesterday]
      ]
    };
  }, [entries]);

  // Build navigation tree
  const navItems = useMemo(() => {
    const items = [];
    
    // Projects section
    items.push({ type: 'header', label: 'Projects' });
    projects.forEach(([project, count]) => {
      items.push({ 
        type: 'project', 
        label: project, 
        count,
        isUnassigned: project === '(unassigned)'
      });
    });

    // Tags section
    items.push({ type: 'header', label: 'Tags' });
    tags.forEach(([tag, count]) => {
      items.push({ type: 'tag', label: tag, count });
    });

    // Recent section
    items.push({ type: 'header', label: 'Recent' });
    recent.forEach(([period, count]) => {
      items.push({ type: 'recent', label: period, count });
    });

    return items;
  }, [projects, tags, recent]);

  useInput((input, key) => {
    if (!isActive) return;
    
    if (key.upArrow) {
      setCursor(prev => {
        const next = prev - 1;
        return next >= 0 ? next : prev;
      });
    }
    if (key.downArrow) {
      setCursor(prev => {
        const next = prev + 1;
        return next < navItems.length ? next : prev;
      });
    }
    if (key.return) {
      const item = navItems[cursor];
      if (item && (item.type === 'project' || item.type === 'tag' || item.type === 'recent')) {
        onSelect(item.label);
      }
    }
  });

  const renderItem = (item, index) => {
    const isSelected = index === cursor;
    const isItemSelected = isSelected && selectedProject === item.label;
    
    if (item.type === 'header') {
      return (
        <Box key={item.label} paddingY={1}>
          <Text color={inkColors.muted} bold>
            {item.label.toUpperCase()}
          </Text>
        </Box>
      );
    }

    const getIcon = () => {
      switch (item.type) {
        case 'project': return item.isUnassigned ? '▹' : '▸';
        case 'tag': return '#';
        case 'recent': return '◷';
        default: return '•';
      }
    };

    return (
      <Box key={`${item.type}-${item.label}`}>
        <Box
          paddingX={2}
          paddingY={0}
          flexDirection="row"
          alignItems="center"
        >
          <Text 
            color={isItemSelected ? inkColors.green : inkColors.muted}
            marginRight={1}
          >
            {getIcon()}
          </Text>
          <Text 
            color={isItemSelected ? inkColors.green : inkColors.text}
            bold={isItemSelected}
          >
            {item.isUnassigned ? (
              <Text color={inkColors.dim} italic>(unassigned)</Text>
            ) : (
              item.label
            )}
          </Text>
          <Box flexGrow={1} />
          <Text 
            color={isItemSelected ? inkColors.greenDim : inkColors.dim}
            backgroundColor={isItemSelected ? inkColors.black : undefined}
          >
            {item.count}
          </Text>
        </Box>
        {isItemSelected && (
          <Box height={1}>
            <Text color={inkColors.green}>▪</Text>
          </Box>
        )}
      </Box>
    );
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
          ◈
        </Text>
        <Text color={isActive ? inkColors.green : inkColors.muted}>
          Projects & Tags
        </Text>
      </Box>

      {/* Tree - compact */}
      <Box flexDirection="column" flexGrow={1}>
        {navItems.map((item, index) => renderItem(item, index))}
      </Box>
    </Box>
  );
}
