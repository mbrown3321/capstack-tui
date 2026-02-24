import { useState, useEffect, useCallback } from 'react';
import path from 'path';
import fs from 'fs';
import os from 'os';
import chokidar from 'chokidar';
import { readIndex, upsertEntry, deleteEntry, makeEntry } from '../store/index.js';

const SCREENSHOT_DIR = path.join(os.homedir(), 'Desktop'); // adjust as needed
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

export function useScreenshots() {
  const [entries, setEntries] = useState(() => readIndex());
  const [watchDir, setWatchDir] = useState(SCREENSHOT_DIR);

  // Index existing screenshots on mount
  useEffect(() => {
    try {
      const files = fs.readdirSync(watchDir);
      const existingEntries = readIndex();
      const existingPaths = new Set(existingEntries.map(e => e.path));
      const newEntries = [];
      
      files.forEach(file => {
        const filePath = path.join(watchDir, file);
        const ext = path.extname(file).toLowerCase();
        
        if (IMAGE_EXTS.has(ext) && !existingPaths.has(filePath)) {
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const entry = makeEntry(filePath);
              newEntries.push(entry);
              upsertEntry(entry);
            }
          } catch (err) {
            // Skip files that can't be accessed
          }
        }
      });
      
      if (newEntries.length > 0) {
        // Add new entries to the beginning of the list
        const updatedEntries = [...newEntries, ...existingEntries];
        setEntries(updatedEntries);
      }
    } catch (err) {
      // If directory can't be read, continue with existing entries
    }
  }, [watchDir]);

  // Watch for new screenshots
  useEffect(() => {
    const watcher = chokidar.watch(watchDir, {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: true, // Don't re-index on watch start
      depth: 2,
    });

    watcher.on('add', (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) return;
      const entry = makeEntry(filePath);
      setEntries(prev => {
        // Don't duplicate
        if (prev.find(e => e.path === filePath)) return prev;
        return upsertEntry(entry) && [entry, ...prev];
      });
    });

    return () => watcher.close();
  }, [watchDir]);

  const updateEntry = useCallback((entry) => {
    upsertEntry(entry);
    setEntries(readIndex());
  }, []);

  const removeEntry = useCallback((id) => {
    deleteEntry(id);
    setEntries(readIndex());
  }, []);

  return { entries, setEntries, updateEntry, removeEntry, watchDir, setWatchDir };
}