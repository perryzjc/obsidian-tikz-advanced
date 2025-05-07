# TikZ Advanced Plugin - Client Component

This directory contains the client-side code for the TikZ Advanced plugin for Obsidian.

## Overview

The client component is responsible for:

1. Processing TikZ code blocks in Obsidian markdown files
2. Communicating with the TikZ server for rendering
3. Displaying rendered diagrams in Obsidian
4. Managing the diagram cache for improved performance
5. Providing user interface controls (toolbar, settings)
6. Handling error display and user feedback

## Architecture

The client follows a modular architecture with the following key components:

- **TikZAdvancedPlugin**: Main plugin class that integrates with Obsidian
- **TikZRenderer**: Processes and renders TikZ diagrams
- **TikZCache**: Manages caching of rendered diagrams
- **TikZServerConnector**: Handles communication with the server
- **TikZSettingTab**: Manages plugin settings UI
- **TikZErrorHandler**: Processes and displays error messages

## Building

The client is built as part of the main plugin build process:

```bash
# From the project root
npm run build

# Or using the utility script
./tikz-tools.sh build
```

This will create the following files in the dist directory:
- `main.js`: The compiled plugin
- `manifest.json`: The plugin manifest
- `styles.css`: The plugin styles

## Installation

After building, copy the following files to your Obsidian vault's plugins directory:
- `dist/main.js`
- `dist/manifest.json`
- `dist/styles.css`

The plugins directory is located at: `<vault>/.obsidian/plugins/obsidian-tikz-advanced/`

## Development

For development with hot reloading:

```bash
npm run dev
```

This will watch for changes and rebuild the plugin automatically.

## Testing

The client components can be tested using:

```bash
npm test
```

See the [Developer Guide](../../docs/DEVELOPER_GUIDE.md) for more information.
