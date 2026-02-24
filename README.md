# 📸 Screenshot Organizer

A TUI for organizing screenshots for tickets and PRs, built with Ink (React for the terminal).

## Setup

```bash
npm install
npm start
```

## Keybindings

| Key | Action |
|-----|--------|
| `Tab` / `1` `2` `3` | Switch views |
| `↑` `↓` | Navigate list |
| `Enter` | Select / open in organizer |
| `Tab` (in organizer) | Switch between fields |
| `Ctrl+S` | Save changes |
| `c` (in organizer) | Copy markdown snippet to clipboard |
| `Esc` | Go back to browser |
| `q` | Quit |

## Configuration

By default the app watches `~/Desktop` for new images. To change this, edit
`SCREENSHOT_DIR` in `src/hooks/useScreenshots.js`.

Screenshot metadata is stored in `~/.screenshot-organizer/index.json`.

## Project Structure

```
src/
  cli.js              # Entry point
  components/
    App.js            # Root component, navigation state
    NavBar.js         # View switcher
  views/
    BrowserView.js    # Scrollable list grouped by project
    OrganizerView.js  # Edit tags, notes, project + copy markdown
    SearchView.js     # Filter by any field
  hooks/
    useScreenshots.js # State management + chokidar file watcher
  store/
    index.js          # Read/write ~/.screenshot-organizer/index.json
```
