# 📸 capstack-tui

A terminal UI for organizing screenshots for tickets and PRs, built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal).

![capstack-tui three-pane interface](./docs/screenshot.svg)

---

## Features

- **Three-pane layout** — projects/tags sidebar, screenshot list, and organizer are always visible simultaneously
- **Live file watching** — new screenshots dropped into your watched folder appear instantly
- **Persistent search** — filter across filenames, tags, projects, and notes from a always-on search bar
- **Tag & project management** — organize screenshots with freeform tags and project names
- **Markdown export** — copy a ready-to-paste markdown snippet to your clipboard in one keystroke
- **Metadata stored locally** — all data lives in `~/.screenshot-organizer/index.json`

---

## Setup

```bash
npm install
npm start
```

By default the app watches `~/Desktop` for new `.png`, `.jpg`, `.jpeg`, `.gif`, and `.webp` files. To change this:

```bash
SCREENSHOT_DIR=~/Downloads npm start
```

Or set it permanently by editing `SCREENSHOT_DIR` in `src/hooks/useScreenshots.js`.

---

## Interface

The UI is split into three persistent panes, always visible side by side.

### Pane 1 — Projects & Tags _(left)_

A tree of all your projects, tags, and recency buckets (Today / Yesterday). Selecting any item instantly filters the screenshot list in the middle pane.

### Pane 2 — Screenshot List _(middle)_

All screenshots matching the current sidebar selection, grouped by date. Tags are shown inline as colored chips. The currently selected screenshot is highlighted and its details load immediately into the right pane.

### Pane 3 — Organizer _(right)_

Metadata editor for the selected screenshot. Edit project name, tags, and notes without leaving the list. A markdown snippet preview is shown at the bottom, ready to copy.

### Search Bar _(top)_

Press `/` at any time to focus the search bar. It filters the list across all fields — filename, project, tags, and notes — in real time. Press `Esc` to clear and return to normal navigation.

---

## Keybindings

### Navigation

| Key | Action |
|-----|--------|
| `1` / `2` / `3` | Focus sidebar / list / organizer pane |
| `Tab` | Cycle focus to the next pane |
| `Shift+Tab` | Cycle focus to the previous pane |
| `↑` / `↓` | Navigate items in the focused pane |
| `/` | Focus the search bar |
| `Esc` | Exit search bar or cancel field editing |
| `q` | Quit |

### In the Organizer pane

| Key | Action |
|-----|--------|
| `Tab` | Cycle through fields (project → tags → notes) |
| `Enter` | Start editing the focused field |
| `Esc` | Cancel editing / return to field navigation |
| `Ctrl+S` | Save changes |
| `c` | Copy markdown snippet to clipboard |
| `d` | Remove screenshot from index |

### In the screenshot list

| Key | Action |
|-----|--------|
| `Enter` | Jump to organizer and begin editing |

---

## Workflow example

1. Take a screenshot — it appears automatically in the list
2. Use `↓` to select it in the list pane
3. Press `3` or `Enter` to jump to the organizer
4. `Tab` to the **project** field, type a project name, press `Enter`
5. `Tab` to **tags**, type a tag, press `Enter` to add it (repeat for more)
6. `Tab` to **notes**, add context, press `Enter`
7. Press `Ctrl+S` to save
8. Press `c` to copy the markdown snippet — paste directly into your PR or ticket

---

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `SCREENSHOT_DIR` | `~/Desktop` | Directory to watch for new screenshots |
| `CAPSTACK_DATA_DIR` | `~/.screenshot-organizer` | Where `index.json` metadata is stored |

---

## Project structure

```
src/
  cli.js                    # Entry point
  components/
    App.js                  # Root — pane layout, keyboard routing, state
    SearchBar.js            # Persistent top search bar
    StatusBar.js            # Context-aware keybinding hints (bottom)
  views/
    SidebarPane.js          # Left pane — projects / tags / recency tree
    ListPane.js             # Middle pane — date-grouped screenshot list
    OrganizerPane.js        # Right pane — metadata editor + markdown preview
  hooks/
    useScreenshots.js       # State management + chokidar file watcher
  store/
    index.js                # Read/write ~/.screenshot-organizer/index.json
docs/
  screenshot.svg            # Interface screenshot (used in this README)
```

---

## Data format

Each entry in `~/.screenshot-organizer/index.json` looks like:

```json
{
  "id": "<base64 of full file path>",
  "filename": "Screenshot 2025-02-26 at 08.15.03.png",
  "path": "/Users/you/Desktop/Screenshot 2025-02-26 at 08.15.03.png",
  "project": "auth-redesign",
  "tags": ["design", "for-pr"],
  "notes": "Login screen after redesign — ready for PR #142",
  "createdAt": "2025-02-26T08:15:03.000Z",
  "indexedAt": "2025-02-26T08:15:10.123Z",
  "size": 911360
}
```

Metadata is preserved across restarts. If a file is deleted from disk, its entry is removed from the index automatically.