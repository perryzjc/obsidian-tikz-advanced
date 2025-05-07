# TikZ Advanced Plugin Developer Guide

This guide is intended for developers who want to contribute to the TikZ Advanced plugin for Obsidian.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Setup](#development-setup)
3. [Building the Plugin](#building-the-plugin)
4. [Testing](#testing)
5. [Architecture](#architecture)
6. [Contributing Guidelines](#contributing-guidelines)
7. [API Documentation](#api-documentation)

## Project Structure

The project is organized into the following directories:

```
obsidian-tikz-advanced/
├── src/                  # Source code
│   ├── client/           # Client-side code (Obsidian plugin)
│   ├── server/           # Server-side code (TikZ rendering server)
│   ├── shared/           # Shared code and types
│   └── __tests__/        # Tests
├── docs/                 # Documentation
├── examples/             # Example TikZ diagrams
├── main.js               # Compiled plugin (output)
├── manifest.json         # Plugin manifest
└── styles.css            # Plugin styles
```

## Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- LaTeX distribution with pdfLaTeX, LuaLaTeX, and/or XeLaTeX
- pdf2svg or Inkscape for SVG conversion

### Setting Up the Development Environment

1. Clone the repository:
   ```
   git clone https://github.com/perryzjc/obsidian-tikz-advanced.git
   cd obsidian-tikz-advanced
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the server:
   ```
   cd src/server
   npm install
   ```

   For detailed server setup instructions, see the [Server Setup Guide](SERVER_SETUP.md).

## Building the Plugin

### Development Build

For development with hot reloading:

```
npm run dev
```

This will watch for changes and rebuild the plugin automatically.

### Production Build

For a production build:

```
npm run build
```

This will create optimized files in the root directory:
- `main.js`: The compiled plugin
- `manifest.json`: The plugin manifest
- `styles.css`: The plugin styles

## Testing

### Running Tests

Run all tests:

```
npm test
```

Run tests in watch mode:

```
npm run test:watch
```

### Writing Tests

Tests are located in the `src/__tests__` directory, organized to mirror the structure of the `src` directory.

Example test file:

```typescript
// src/__tests__/client/tikzRenderer.test.ts
import { TikZRenderer } from '../../client/tikzRenderer';

describe('TikZRenderer', () => {
  test('should render TikZ diagram', () => {
    // Test code here
  });
});
```

## Architecture

### Client-Server Architecture

The plugin uses a client-server architecture:

1. **Client** (Obsidian Plugin):
   - Handles user interface
   - Processes TikZ code blocks
   - Communicates with the server
   - Manages caching
   - Displays rendered diagrams

2. **Server**:
   - Renders TikZ diagrams using LaTeX
   - Converts PDF to SVG
   - Handles errors
   - Provides API endpoints

### Client-Side Components

- **TikZAdvancedPlugin**: Main plugin class
- **TikZRenderer**: Renders TikZ diagrams
- **TikZCache**: Caches rendered diagrams
- **TikZServerConnector**: Communicates with the server
- **TikZSettingTab**: Settings UI

### Server-Side Components

- **TikZRenderer**: Renders TikZ diagrams using LaTeX
- **LaTeXEngineManager**: Manages LaTeX engines
- **SVGOptimizer**: Optimizes SVG output
- **LaTeXErrorParser**: Parses and formats LaTeX errors

### Data Flow

#### Initialization Flow

1. Plugin is loaded in Obsidian
2. Plugin loads settings
3. Plugin registers the TikZ code block processor

#### Rendering Flow

1. User creates a TikZ code block in Obsidian
2. Plugin processes the code block
3. Plugin checks cache for the diagram
4. If not in cache, plugin sends request to server
5. Server renders the diagram using LaTeX
6. Server returns the rendered diagram
7. Plugin displays the diagram and caches it

#### Server Connection Flow

1. User configures server URL in settings
2. Plugin tests the connection to the server
3. Plugin updates connection status

## Contributing Guidelines

### Code Style

- Use TypeScript for all code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Run the tests
6. Submit a pull request

### Commit Message Format

Use conventional commit messages:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
chore: Update build process
```

## API Documentation

For detailed API documentation, see the [API Documentation](API.md) file.

This includes:
- Client-Side API (TikZRenderer, TikZServerConnector, TikZCache)
- Server-Side API (REST endpoints, TikZRenderer, LaTeXEngineManager)
- Shared Types (TikZRenderRequest, TikZRenderResult, HealthResponse)
