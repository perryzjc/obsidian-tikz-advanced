# TikZ Advanced Troubleshooting Guide

This guide will help you troubleshoot common issues with the TikZ Advanced plugin.

## Server Issues

### Auto-Starting Server Won't Start

**Problem**: The auto-starting server fails to start when Obsidian loads.

**Solution**:
1. Make sure Node.js is installed and in your PATH
2. Make sure LaTeX is installed and in your PATH
3. Check the console for error messages (Ctrl+Shift+I in Obsidian)
4. Try manually starting the server from the plugin settings
5. If all else fails, you can disable the auto-start feature and run the server manually

### Node.js Not Found

**Error**: `Error: Node.js is required to run the local server. Please install Node.js.`

**Solution**: Install Node.js from https://nodejs.org/ (version 14 or later)

### Server Won't Start (Manual Start)

**Error**: `TSError: ⨯ Unable to compile TypeScript: server.ts:45:20 - error TS2354: This syntax requires an imported helper but module 'tslib' cannot be found.`

**Solution**: Install the missing `tslib` dependency:
```bash
cd src/server
npm install tslib
```

### LaTeX Engines Not Found

**Error**: `No LaTeX engines available` or `LaTeX engine pdflatex is not available`

**Solution**: Install LaTeX on your system:

- **Ubuntu/Debian**:
  ```bash
  sudo apt-get update
  sudo apt-get install texlive-latex-base texlive-latex-extra texlive-latex-recommended texlive-fonts-recommended texlive-science texlive-pictures
  ```

- **macOS**:
  ```bash
  brew install --cask mactex
  ```

- **Windows**:
  Download and install MiKTeX from https://miktex.org/download

### Port Conflict

**Error**: `Error: No available ports found` or `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
1. Change the preferred port in the plugin settings
2. Close any other applications that might be using the port
3. Restart Obsidian
4. If using the auto-starting server, the plugin will automatically try to find an available port

### PDF to SVG Conversion Fails

**Error**: `Failed to convert PDF to SVG. Please install pdf2svg, Inkscape, or pdftocairo.`

**Solution**: Install one of the supported PDF to SVG converters:

- **Ubuntu/Debian**:
  ```bash
  sudo apt-get install pdf2svg
  ```

- **macOS**:
  ```bash
  brew install pdf2svg
  ```

- **Windows**:
  Download and install pdf2svg from https://github.com/jalios/pdf2svg-windows

## Client Issues

### Plugin Not Loading

**Problem**: The plugin doesn't appear in Obsidian's community plugins list.

**Solution**: Make sure you've copied the following files to the correct directory:
- `main.js`
- `manifest.json`
- `styles.css`

The correct directory is: `<vault>/.obsidian/plugins/obsidian-tikz-advanced/`

### Can't Connect to Server

**Problem**: The plugin shows "Server connection failed" error.

**Solution for auto-starting local server**:
1. Check if the server is running in the plugin settings
2. Try manually starting the server from the plugin settings
3. Check the console for error messages (Ctrl+Shift+I in Obsidian)
4. Make sure Node.js and LaTeX are installed and in your PATH

**Solution for manual server setup**:
1. Make sure the server is running
2. Check the server URL in the plugin settings
3. Make sure there are no firewall issues
4. Try using `http://localhost:3000` if running locally

**Solution for remote server**:
1. Make sure the server is running on the remote machine
2. Check the server URL in the plugin settings
3. Make sure the server is accessible from your network
4. Check for firewall or CORS issues

### TikZ Diagrams Not Rendering

**Problem**: TikZ code blocks are not being rendered.

**Solution**:
1. Make sure the plugin is enabled
2. Make sure the code block has the `tikz` language identifier:
   ````
   ```tikz
   \begin{tikzpicture}
     \draw (0,0) circle (1cm);
   \end{tikzpicture}
   ```
   ````
3. Check the server connection
4. Look for error messages in the diagram

## LaTeX Errors

### Undefined Control Sequence

**Error**: `Undefined control sequence`

**Solution**: This usually means you're using a LaTeX command that doesn't exist or you haven't loaded the required package. Add the necessary package to the preamble in the plugin settings.

### Missing Package

**Error**: `Package not found: <package-name>`

**Solution**: Install the missing LaTeX package:

- **Ubuntu/Debian**:
  ```bash
  sudo apt-get install texlive-latex-extra
  ```

- **macOS/Windows**:
  The package manager in MiKTeX or TeX Live should automatically install missing packages.

### Math Mode Errors

**Error**: `Missing $ inserted`

**Solution**: This usually means you're using math mode commands outside of math mode. Enclose them in `$...$`.

## Still Having Issues?

If you're still having issues, try the following:

1. Check the server logs for more detailed error information
2. Enable debug mode in the plugin settings
3. Try using a different LaTeX engine
4. Try using a simpler TikZ diagram to isolate the issue
