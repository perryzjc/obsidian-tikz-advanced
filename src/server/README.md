# TikZ Advanced Plugin - Server Component

This directory contains the server-side code for the TikZ Advanced plugin for Obsidian.

## Overview

The server component is responsible for:

1. Rendering TikZ diagrams using LaTeX
2. Converting PDF output to SVG when requested
3. Providing a REST API for the client
4. Handling LaTeX errors and providing useful feedback
5. Offering a web UI for testing and direct usage

## Architecture

The server follows a modular architecture with the following key components:

- **Server**: Express.js server that handles HTTP requests
- **TikZRenderer**: Renders TikZ diagrams using LaTeX
- **LaTeXEngineManager**: Manages LaTeX engines and their availability
- **SVGOptimizer**: Optimizes SVG output for better performance
- **LaTeXErrorParser**: Parses and formats LaTeX errors for better user feedback

## Prerequisites

- **Node.js** (v14 or later)
- **LaTeX distribution** with at least one of:
  - pdfLaTeX (fastest, good for most diagrams)
  - LuaLaTeX (better for complex diagrams)
  - XeLaTeX (good for custom fonts)
- **PDF to SVG converter** (at least one of):
  - pdf2svg (recommended)
  - Inkscape
  - pdftocairo

## Installation

1. Install dependencies:
   ```bash
   npm install

   # Or using the utility script from project root
   ../tikz-tools.sh setup
   ```

2. Start the server:
   ```bash
   npm start

   # Or in debug mode
   LOG_LEVEL=debug npm start

   # Or using the utility script from project root
   ../tikz-tools.sh start
   ../tikz-tools.sh debug  # For debug mode
   ```

The server will run on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "engines": {
    "pdflatex": true,
    "lualatex": true,
    "xelatex": false
  }
}
```

### Render TikZ

```
POST /render
Content-Type: application/json

{
  "tikzCode": "\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}",
  "format": "svg",
  "engine": "pdflatex",
  "preamble": "\\usepackage{tikz}",
  "source": "obsidian-plugin"
}
```

Response (Success with SVG):

```json
{
  "content": "<svg>...</svg>",
  "format": "svg",
  "width": 100,
  "height": 100,
  "success": true
}
```

Response (Success with PDF):

```json
{
  "content": "base64-encoded-pdf",
  "format": "pdf",
  "success": true
}
```

Response (Error):

```json
{
  "error": "Error message",
  "success": false
}
```

## Web UI

The server includes a web UI for testing and direct usage. You can access it at http://localhost:3000.

The web UI provides:
- A TikZ code editor
- LaTeX preamble configuration
- Format selection (SVG/PDF)
- Real-time rendering
- Error display with helpful suggestions

## Docker

You can also run the server using Docker:

```bash
docker-compose up -d
```

This will start the server on port 3000 and include all necessary dependencies.

## Development

For development:

```bash
# Run with nodemon for auto-restart on changes
npm run dev

# Run tests
npm test
```

See the [Developer Guide](../../docs/DEVELOPER_GUIDE.md) for more information.
