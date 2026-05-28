# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**个人重要信息库** (Personal Information Library) is a browser-based password and credential manager. It's a single-file HTML application that runs entirely in the browser with no external dependencies or server requirements.

- **Main file**: `index.html` (contains all HTML, CSS, and JavaScript)
- **Data storage**: Browser localStorage (5-10MB capacity)
- **Deployment**: Open the HTML file directly in any modern browser
- **No build process required**

## Architecture

The application uses a single-file architecture with modular JavaScript functions organized by feature:

### Core Modules

1. **Data Management** (`save()`, `saveEntry()`, `deleteEntry()`, `editEntry()`)
   - Manages CRUD operations on the `entries` array
   - Persists data to localStorage
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
   - `pasteFromClipboard()` reads clipboard and auto-fills form
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

### Bookmarklet Workflow (Updated)
1. User clicks bookmarklet on any webpage
2. Bookmarklet copies `{infoLib: true, name: document.title, url: location.href}` to clipboard
3. Green notification appears on the page
4. User returns to the app and clicks "📋 粘贴" button
5. `pasteFromClipboard()` reads clipboard and auto-fills the form

### Data Persistence
- All data stored in `localStorage['pwd_entries']` as JSON string
- Automatic save on every add/edit/delete operation
- No server sync; data is local-only

## Common Tasks

### Adding a New Feature
1. Add HTML elements to the form or list template in the `render()` function
2. Add corresponding JavaScript logic (usually a new function)
3. Call `save()` after data changes
4. Call `render()` to update the UI
5. Test in browser by opening `index.html`

### Modifying the Bookmarklet
- Edit the `setupBookmarklet()` function (line ~642)
- The bookmarklet code is minified JavaScript; keep it compact
- Test by dragging the updated button to bookmarks and clicking it on a test page

### Changing Data Structure
- Update the entry object structure in `saveEntry()` and `render()`
- Update `importData()` to handle migration if needed
- Consider backward compatibility with existing localStorage data

### Styling Changes
- All CSS is in the `<style>` tag at the top of the file
- Uses CSS Grid and Flexbox for layout
- Dark theme with gradient accents (#7b2ff7, #00d2ff)
- Responsive breakpoint at 600px for mobile

## Testing

No automated test framework. Manual testing workflow:
1. Open `index.html` in browser
2. Test core flows: add entry → edit → delete → search → filter
3. Test bookmarklet: drag button to bookmarks, click on a webpage, paste in app
4. Test import/export: export data, clear localStorage, import backup
5. Test on different browsers (Chrome, Firefox, Edge, Safari)

## Documentation Files

- `01_需求文档.html` - Requirements and feature specifications
- `02_设计文档.html` - Architecture and module design
- `03_单元测试报告.html` - Test coverage report
- `04_功能使用说明.html` - User manual

## Security Notes

- **No encryption**: Passwords stored in plaintext in localStorage
- **Local-only**: No data sent to servers
- **Browser-dependent**: Data lost if browser cache is cleared
- **Backup recommended**: Users should regularly export backups
- **Not for public computers**: Intended for personal use only

## Browser Compatibility

- Chrome 4+, Firefox 3.5+, Edge, Safari
- Requires localStorage support
- Requires Clipboard API for bookmarklet paste feature
- Modern CSS features (Grid, Flexbox, gradients)
