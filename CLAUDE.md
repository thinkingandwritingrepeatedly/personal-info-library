# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**个人重要信息库** (Personal Information Library) is a browser-based password and credential manager. The frontend is a single-file HTML application, with a local Node.js server providing data persistence to the file system.

- **Main file**: `index.html` (contains all HTML, CSS, and JavaScript)
- **Data service**: `server.js` (Node.js HTTP server, built-in modules only)
- **Data storage**: `D:\重要数据\info_data.json` (JSON file on local disk)
- **Deployment**: Start `server.js` first, then open `http://localhost:3456`
- **Startup**: `start.bat` or `node server.js`

## Architecture

The application uses a single-page frontend with a local data service backend.

```
Browser (index.html)  ←→  Node.js Server (server.js:3456)  ←→  D:\重要数据\info_data.json
```

### Core Modules

1. **Data Management** (`save()`, `saveEntry()`, `deleteEntry()`, `editEntry()`)
   - Manages CRUD operations on the `entries` array
   - Persists data via HTTP API (`POST /api/data`) → `D:\重要数据\info_data.json`
   - Data structure: `{ id, name, url, user, pass, note, createdAt }`

2. **UI Rendering** (`render()`, `getFiltered()`, `updateStats()`)
   - Main render function updates the entire entry list
   - Filtering combines search keywords with time ranges (today/week/month)
   - Statistics panel shows totals and high-frequency keywords

3. **Form Management** (`showForm()`, `hideForm()`, `saveEntry()`)
   - Handles both new entry creation and editing
   - Form fields: name, url, user, pass, note
   - Validation: at least name or url required

4. **Search & Filter** (`getFiltered()`)
   - Searches across name, url, and note fields (case-insensitive)
   - Time-based filtering: all/today/week/month
   - Filters are composable (search + time range)

5. **Batch Operations** (`toggleSelect()`, `batchExport()`, `batchDelete()`)
   - Uses a `Set` to track selected entry IDs
   - Batch export creates JSON files
   - Batch delete requires confirmation

6. **Import/Export** (`exportData()`, `importData()`)
   - Export: downloads JSON file with all entries
   - Import: validates JSON, deduplicates by ID, adds missing timestamps

7. **Bookmarklet Tool** (`setupBookmarklet()`, `pasteFromClipboard()`)
   - Bookmarklet copies current page title and URL to clipboard as JSON
   - `pasteFromClipboard()` reads clipboard and auto-fills the form
   - Workaround for Chrome's security restrictions on file:// URLs

8. **Statistics** (`updateStats()`)
   - Counts records by time period
   - Extracts high-frequency keywords from names and notes
   - Filters out short words, numbers, and protocol keywords

## Key Implementation Details

### Event Handling
- Event delegation on `#entries` container for entry actions (edit, delete, copy, toggle password)
- Search and filter inputs trigger `render()` on change
- Checkbox changes update the `selected` Set

### Password Display
- Passwords default to hidden (shown as "••••••")
- Toggle button shows/hides password in plaintext
- Copy button copies to clipboard

### Bookmarklet Workflow
1. User clicks bookmarklet on any webpage
2. Bookmarklet copies `{infoLib: true, name: document.title, url: location.href}` to clipboard
3. Green notification appears on the page
4. User returns to the app and clicks "📋 粘贴" button
5. `pasteFromClipboard()` reads clipboard and auto-fills the form

### Data Persistence
- All data stored in `D:\重要数据\info_data.json` as JSON string
- `save()` is now async: uses `fetch()` → `POST /api/data` to the local server
- `loadData()` runs on page load: uses `fetch GET /api/data` to read from server
- No server sync; data is local-only

### Server (server.js)
- Built with `http`, `fs`, `path` modules (zero npm dependencies)
- Serves static files (index.html) and API endpoints
- `GET /api/data` → reads and returns `D:\重要数据\info_data.json`
- `POST /api/data` → writes request body to `D:\重要数据\info_data.json`
- Auto-fallback port (tries 3456-3465)
- `process.title = 'info-library-server'` for process identification

## Common Tasks

### Adding a New Feature
1. Add HTML elements to the form or list template in the `render()` function
2. Add corresponding JavaScript logic (usually a new function)
3. Call `await save()` after data changes (note: save is now async)
4. Call `render()` to update the UI
5. Test by starting `server.js` and visiting `http://localhost:3456`

### Modifying the Bookmarklet
- Edit the `setupBookmarklet()` function
- The bookmarklet code is minified JavaScript; keep it compact
- Test by dragging the updated button to bookmarks and clicking it on a test page

### Changing Data Structure
- Update the entry object structure in `saveEntry()` and `render()`
- Update `importData()` to handle migration if needed
- The JSON file at `D:\重要数据\info_data.json` must contain a valid array

### Styling Changes
- All CSS is in the `<style>` tag at the top of the file
- Uses CSS Grid and Flexbox for layout
- Fresh light style with gradient accents (#7c3aed, #06b6d4)
- Responsive breakpoint at 600px for mobile

## Testing

No automated test framework. Manual testing workflow:
1. Run `node server.js` to start the data service
2. Open `http://localhost:3456` in browser
3. Test core flows: add entry → edit → delete → search → filter
4. Test bookmarklet: drag button to bookmarks, click on a webpage, paste in app
5. Test import/export: export data, delete data file, import backup
6. Test on different browsers (Chrome, Firefox, Edge, Safari)

## Documentation Files

- `01_需求文档.html` - Requirements and feature specifications
- `02_设计文档.html` - Architecture and module design
- `03_单元测试报告.html` - Test coverage report
- `04_功能使用说明.html` - User manual
- `技术文档.md` - Technical documentation

## Security Notes

- **No encryption**: Passwords stored in plaintext in JSON file
- **Local-only**: Data stored on local disk, served only to localhost
- **File-dependent**: Data lost if JSON file is deleted or corrupted
- **Backup recommended**: Users should regularly export backups
- **Not for public computers**: Intended for personal use only

## Prerequisites

- **Node.js** (v12+) required to run the data service
- **Modern browser**: Chrome, Edge, Firefox, Safari
- **Clipboard API** required for bookmarklet paste feature
