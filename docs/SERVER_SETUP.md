# TikZ Advanced Server Setup Guide

This guide provides detailed instructions for setting up and running the TikZ server, which is required for rendering TikZ diagrams with the TikZ Advanced plugin for Obsidian.

## Prerequisites

Before setting up the server, ensure you have the following installed:

- **Node.js** (v14 or later)
- **LaTeX distribution** with at least one of:
  - pdfLaTeX (fastest, good for most diagrams)
  - LuaLaTeX (better for complex diagrams)
  - XeLaTeX (good for custom fonts)
- **PDF to SVG converter** (at least one of):
  - pdf2svg (recommended)
  - Inkscape
  - pdftocairo

## Option 1: Local Server Setup (Recommended)

This is the simplest and recommended approach for most users.

1. Navigate to the `src/server` directory:
   ```bash
   cd src/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or use the provided utility script from the project root:
   ```bash
   ./tikz-tools.sh start
   ```

4. The server will run on port 3000 by default. You can change the port by setting the `PORT` environment variable:
   ```bash
   PORT=3001 npm start
   ```

5. Verify the server is running by opening http://localhost:3000 in your browser. You should see the TikZ web UI.

## Option 2: Docker Setup

If you prefer using Docker, follow these steps:

1. Ensure Docker and Docker Compose are installed on your system.

2. Navigate to the `src/server` directory:
   ```bash
   cd src/server
   ```

3. Build and start the Docker container:
   ```bash
   docker-compose up -d
   ```

4. The server will be available at http://localhost:3000.

5. To stop the server:
   ```bash
   docker-compose down
   ```

## Option 3: Remote Server Setup

For advanced users who want to run the server on a remote machine:

1. Copy the `src/server` directory to your remote server.

2. Install dependencies and start the server as in Option 1.

3. Make sure the server is accessible from your Obsidian client.

4. Configure the plugin to use the remote server URL in the settings.

## Server Configuration

The server can be configured using environment variables:

- `PORT`: The port to run the server on (default: 3000)
- `LOG_LEVEL`: The logging level (default: info, options: debug, info, warn, error)
- `TEMP_DIR`: Directory for temporary files (default: ./tmp)
- `CACHE_TTL`: Cache time-to-live in seconds (default: 3600)
- `ENABLE_PROGRESSIVE_RENDERING`: Enable smart progressive rendering (default: true)
- `ENABLE_SMART_PREPROCESSING`: Enable smart preprocessing of TikZ code (default: true)
- `MAX_RENDERING_ATTEMPTS`: Maximum number of rendering attempts for progressive rendering (default: 4)
- `ENABLE_LIBRARY_DETECTION`: Enable automatic detection of required TikZ libraries (default: true)
- `ENABLE_ERROR_SUGGESTIONS`: Enable helpful error suggestions (default: true)

Example:
```bash
PORT=3001 LOG_LEVEL=debug npm start
```

## Troubleshooting

### Common Issues

1. **Server won't start**:
   - Check if the port is already in use
   - Ensure Node.js is installed and in your PATH
   - Check for error messages in the console

2. **LaTeX errors**:
   - Ensure LaTeX is installed and in your PATH
   - Check if the required LaTeX packages are installed

3. **SVG conversion errors**:
   - Ensure pdf2svg or another converter is installed and in your PATH

### Checking LaTeX Installation

To verify your LaTeX installation, run:

```bash
pdflatex --version
```

### Checking PDF to SVG Converter

To verify your pdf2svg installation, run:

```bash
pdf2svg --version
```

## Advanced Usage

### Running in Debug Mode

For more detailed logging:

```bash
LOG_LEVEL=debug npm start
```

### Using a Custom Temporary Directory

```bash
TEMP_DIR=/path/to/temp npm start
```

### Running Behind a Reverse Proxy

The server can be run behind a reverse proxy like Nginx or Apache. Ensure CORS is properly configured if the server is on a different domain than Obsidian.

## Security Considerations

1. **Run the server locally** whenever possible
2. **Do not expose the server** to the public internet without proper authentication and security measures
3. **Keep the plugin and its dependencies updated** to the latest versions
4. **Review TikZ code** before rendering, especially if it comes from untrusted sources

For more information, see the [Security Policy](../SECURITY.md).
