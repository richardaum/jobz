# Chrome Extension - Jobz

A Chrome extension built with Vite, TypeScript, and React that matches job descriptions with your resume using OpenAI.

## Architecture

This extension follows **Feature Sliced Design (FSD)** methodology. See [FSD.md](./FSD.md) for details.

### Structure

```
src/
├── app/              # Application setup
├── pages/            # Page components (popup)
├── widgets/          # Composite UI blocks (match result)
├── features/         # User interactions
│   ├── extract-job/  # Extract job description from pages
│   └── match-job/    # Match job with resume using OpenAI
├── entities/         # Business entities
│   ├── job/          # Job description entity
│   └── resume/       # Resume entity
└── shared/           # Shared infrastructure
    ├── api/          # OpenAI client
    ├── ui/           # UI components (Button, Input)
    ├── lib/          # Utilities (resume loader)
    └── config/       # Configuration (API key storage)
```

## Features

- **Job Description Extraction**: Automatically extracts job descriptions from LinkedIn (extensible to other sources)
- **Resume Matching**: Uses OpenAI to compare job descriptions with your resume and returns a match percentage
- **Multiple Sources**: Prepared for extracting from LinkedIn, Indeed, Glassdoor, and generic job sites
- **Resume Storage**: Saves your resume in browser storage for quick access

## Setup

1. Install dependencies:

```bash
bun install
```

2. Configure environment variables:

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Note: Vite only exposes variables prefixed with VITE_ to the client
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

3. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. Build the extension:

```bash
bun run build
```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `packages/chrome-extension/dist` folder

## Development

### Development Mode with HMR

```bash
bun run dev
```

This will start the Vite dev server with Hot Module Replacement (HMR) enabled. Changes to React components and TypeScript files will be automatically reflected in the extension without needing to manually reload.

**Note**: HMR works for the popup and React components. For changes to `manifest.json` or `background.js`, you may still need to reload the extension manually.

### Manual Reload (when needed)

If you need to manually reload the extension:

1. Go to `chrome://extensions/`
2. Click the reload button (🔄) on your extension
3. Or use keyboard shortcut: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows/Linux)

### Tips for Faster Development

1. **HMR is enabled**: Most changes will hot-reload automatically
2. **Watch the console**: Check the browser console and extension service worker console for errors
3. **Use React DevTools**: Install React DevTools extension for better debugging

## Build

```bash
bun run build
```

## Permissions

- `storage`: To save API key and resume
- `activeTab`: To extract job descriptions from current tab
- `host_permissions`: To access job posting pages

## HMR / Hot Module Replacement

The extension uses `@samrum/vite-plugin-web-extension` with HMR support enabled:

- ✅ **Hot Module Replacement**: React components and TypeScript files update automatically
- ✅ **Dev Server**: Uses Vite dev server for fast rebuilds
- ✅ **Source Maps**: Enabled for better debugging
- ⚠️ **Manual reload may be needed**: For `manifest.json` or `background.js` changes
