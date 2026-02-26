import { useState, useEffect, useCallback } from 'react';
import chokidar from 'chokidar';
import path from 'path';
import { readIndex, makeEntry, upsertEntry, deleteEntry } from '../store/index.js';

const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || path.join(process.env.HOME, 'Desktop');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

function isImage(filepath) {
  return IMAGE_EXTS.has(path.extname(filepath).toLowerCase());
}

export default function useScreenshots() {
  const [screenshots, setScreenshots] = useState([]);

  // Load persisted index on mount
  useEffect(() => {
    setScreenshots(readIndex());
  }, []);

  // Watch filesystem for new/removed screenshots
  useEffect(() => {
    const watcher = chokidar.watch(SCREENSHOT_DIR, {
      ignoreInitial: false,
      depth: 0,
    });

    watcher.on('add', (filepath) => {
      if (!isImage(filepath)) return;
      setScreenshots(prev => {
        // store uses base64(filepath) as id; check by .path to avoid dupes
        if (prev.some(s => s.path === filepath)) return prev;
        const entry = makeEntry(filepath);
        return upsertEntry(entry); // writes to disk, returns updated array
      });
    });

    watcher.on('unlink', (filepath) => {
      if (!isImage(filepath)) return;
      setScreenshots(prev => {
        const entry = prev.find(s => s.path === filepath);
        if (!entry) return prev;
        return deleteEntry(entry.id); // writes to disk, returns updated array
      });
    });

    return () => watcher.close();
  }, []);

  const updateScreenshot = useCallback((id, patch) => {
    setScreenshots(prev => {
      const existing = prev.find(s => s.id === id);
      if (!existing) return prev;
      return upsertEntry({ ...existing, ...patch });
    });
  }, []);

  const deleteScreenshot = useCallback((id) => {
    setScreenshots(() => deleteEntry(id));
  }, []);

  return { screenshots, updateScreenshot, deleteScreenshot };
}