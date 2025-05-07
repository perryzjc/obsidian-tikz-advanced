# TikZ Advanced Plugin User Guide

This guide will help you get started with the TikZ Advanced plugin for Obsidian.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Plugin Settings](#plugin-settings)
5. [TikZ Syntax](#tikz-syntax)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## Introduction

TikZ Advanced is a plugin for Obsidian that allows you to render TikZ diagrams directly in your notes. It uses a client-server architecture for robust rendering, supporting multiple LaTeX engines and output formats. The plugin includes smart compatibility features that make it more robust when handling various TikZ code styles and common errors.

### Key Features

- Render TikZ diagrams in Obsidian
- Support for SVG and PDF output formats
- Zoom functionality for diagrams
- Caching system for improved performance
- Support for multiple LaTeX engines (pdfLaTeX, LuaLaTeX, XeLaTeX)
- Smart library detection and auto-inclusion
- Comprehensive error handling with user-friendly error display
- Helpful suggestions for missing libraries and packages

## Installation

### Plugin Installation

1. Download the latest release from the [GitHub repository](https://github.com/perryzjc/obsidian-tikz-advanced/releases)
2. Extract the `main.js`, `manifest.json`, and `styles.css` files to your Obsidian vault's plugins directory:
   `<vault>/.obsidian/plugins/obsidian-tikz-advanced/`
3. Enable the plugin in Obsidian settings

### Server Setup

The TikZ server is required for rendering TikZ diagrams. You need to run it manually before using the plugin.

For complete server setup instructions, including prerequisites, Docker setup, and troubleshooting, see the [Server Setup Guide](SERVER_SETUP.md).

Quick start:

1. Ensure you have Node.js and LaTeX installed
2. Navigate to the `src/server` directory
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. The server will run on port 3000 by default
6. Configure the plugin to use the server URL in the settings (default: `http://localhost:3000`)

## Basic Usage

To create a TikZ diagram in Obsidian, create a code block with the `tikz` language identifier:

````markdown
```tikz
\begin{tikzpicture}
  \draw (0,0) circle (1cm);
\end{tikzpicture}
```
````

The diagram will be automatically rendered in your note. You can use the toolbar above the diagram to:

- Switch between SVG and PDF formats
- Zoom in and out of the diagram
- Refresh the diagram

## Plugin Settings

You can configure the plugin in the Obsidian settings:

### Server Settings

- **TikZ Server URL**: URL of the TikZ rendering server (default: `http://localhost:3000`)
- **Preferred LaTeX Engine**: Choose between pdfLaTeX, LuaLaTeX, and XeLaTeX

### Rendering Settings

- **Default Output Format**: Choose between SVG and PDF
- **Enable Zoom**: Toggle zoom functionality
- **Auto Refresh**: Automatically refresh diagrams when code changes

### Cache Settings

- **Enable Cache**: Cache rendered TikZ diagrams to improve performance
- **Cache TTL (minutes)**: Time to live for cached diagrams in minutes
- **Show Cache Indicator**: Show an indicator when a diagram is loaded from cache

### Advanced Settings

- **Custom Preamble**: Add custom LaTeX preamble for your diagrams
- **Debug Mode**: Enable debug mode for troubleshooting

## TikZ Syntax

TikZ is a powerful drawing package for LaTeX. Here are some basic examples:

### Basic Shapes

```tikz
\begin{tikzpicture}
  \draw (0,0) circle (1cm);
  \draw (3,0) rectangle (5,2);
  \draw (7,0) -- (8,2) -- (9,0) -- cycle;
\end{tikzpicture}
```

### Styling

```tikz
\begin{tikzpicture}
  \draw[thick, red] (0,0) circle (1cm);
  \draw[fill=blue, opacity=0.5] (3,0) rectangle (5,2);
  \draw[thick, green, dashed] (7,0) -- (8,2) -- (9,0) -- cycle;
\end{tikzpicture}
```

### Text and Labels

```tikz
\begin{tikzpicture}
  \draw (0,0) circle (1cm);
  \node at (0,0) {Center};
  \draw (3,0) rectangle (5,2);
  \node[above right] at (3,0) {Rectangle};
\end{tikzpicture}
```

### Plots with PGFPlots

```tikz
\begin{tikzpicture}
\begin{axis}[
    title={Simple Function},
    xlabel={$x$},
    ylabel={$y$},
    xmin=-2, xmax=2,
    ymin=-4, ymax=4,
    legend pos=north west,
    grid=both
]
\addplot[blue, domain=-2:2, samples=100] {x^2};
\addplot[red, domain=-2:2, samples=100] {x^3};
\legend{$x^2$, $x^3$}
\end{axis}
\end{tikzpicture}
```

## Advanced Features

### Using TikZ Libraries

You can include TikZ libraries directly in your code:

```tikz
\usetikzlibrary{bayesnet,positioning}
\begin{tikzpicture}
  \node[latent] (A) {A};
  \node[obs, right=of A] (B) {B};
  \edge {A} {B};
\end{tikzpicture}
```

The plugin will:
1. Automatically extract the library declarations
2. Add them to the preamble
3. Render the diagram with the required libraries

Additionally, the plugin automatically detects required libraries based on your code, even if you don't explicitly declare them.

### Custom Preamble

For advanced use cases, you can still add custom LaTeX packages and commands to the preamble in the plugin settings. This is useful for specialized packages or defining custom commands.

Example preamble:

```latex
% Only needed for specialized packages not auto-detected
\usepackage{tikz-cd}
\usepackage{chemfig}
\usepackage{amsmath}
\usepackage{amssymb}
```

Note: You no longer need to include common TikZ libraries in the custom preamble, as they can be included directly in your code or will be auto-detected.

### Caching

The plugin caches rendered diagrams to improve performance. When a diagram is loaded from cache, a "(cached)" indicator is shown in the toolbar.

You can configure the cache TTL (time to live) in the plugin settings. The default is 60 minutes.

## Troubleshooting

### Server Connection Issues

If the plugin cannot connect to the server:

1. **For local server**:
   - Check that the server URL is correct in the plugin settings (default: `http://localhost:3000`)
   - Make sure the server is running
   - Check if Node.js is installed and in your PATH
   - Check if LaTeX is installed and in your PATH
   - Check for firewall or network issues
   - Look at the server logs for errors
   - Check the console for error messages (Ctrl+Shift+I in Obsidian)

2. **For remote server**:
   - Check that the server URL is correct and accessible
   - Make sure the server is running
   - Check for firewall or network issues
   - Verify that CORS is properly configured on the server

### Rendering Issues

If a diagram fails to render:

1. Check the error message displayed in the diagram
2. Make sure the TikZ code is valid
3. Try using a different LaTeX engine
4. Check the server logs for more detailed error information

### Common LaTeX Errors

- **Undefined control sequence**: You're using a command that LaTeX doesn't recognize. Check for typos or missing packages.
- **Missing $ inserted**: You're using math mode commands outside of math mode. Enclose them in `$...$`.
- **File not found**: A required package or file is missing. Make sure all required packages are installed on the server.

## Smart Compatibility Features

The TikZ Advanced Plugin includes smart compatibility features that make it more robust when handling various TikZ code styles and common errors. These features help you focus on your content rather than worrying about boilerplate code or syntax details.

### Automatic Document Structure

You can write TikZ code in various styles, and the plugin will adapt:

- **Complete LaTeX Documents**: If you include `\\documentclass`, `\\begin{document}`, and `\\end{document}`, your code will be used as-is
- **TikZ Environments Only**: If you only include the `tikzpicture` environment, the plugin will add the necessary document structure
- **Raw TikZ Commands**: You can even write raw TikZ commands without any environment, and the plugin will wrap them appropriately

### Automatic Library Detection

The plugin can detect when your code requires specific TikZ libraries and automatically include them. For example, if you use:

- Arrow tips (→) - Adds `arrows.meta` library
- Node shapes (circles, rectangles) - Adds appropriate shape libraries
- Positioning commands (above, below) - Adds `positioning` library
- Celsius symbol (°C) - Adds `siunitx` package
- Bayesian network components - Adds `bayesnet` library
- Circuit elements - Adds `circuits` library
- Decorations - Adds appropriate `decorations` libraries

You can also explicitly include libraries in your code using `\usetikzlibrary{...}` at the beginning of your TikZ code block.

### Intelligent Error Handling

When errors occur, the plugin provides specific suggestions based on the error type and code content:

- Suggests required libraries and packages for undefined commands
- Identifies blank lines in environments that should be removed
- Provides guidance for fixing common syntax errors
- Recommends specific TikZ libraries based on the commands you're trying to use
- Gives detailed error messages with actionable suggestions

For more details about these features, see the [Smart Compatibility Features](SMART_COMPATIBILITY.md) guide.

## FAQ

### Q: How do I use TikZ libraries?

A: You can include TikZ libraries directly in your code using `\usetikzlibrary{...}` at the beginning of your TikZ code block:

```tikz
\usetikzlibrary{arrows.meta,shapes,positioning}
\begin{tikzpicture}
  % Your TikZ code here
\end{tikzpicture}
```

Additionally, the plugin automatically detects many commonly used libraries based on the commands in your code.

### Q: Can I use PGFPlots?

A: Yes, PGFPlots is supported. You can use it directly in your code:

```tikz
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\begin{tikzpicture}
\begin{axis}[title={Simple Function}]
  \addplot[blue, domain=-2:2] {x^2};
\end{axis}
\end{tikzpicture}
```

The plugin will automatically detect and include PGFPlots when needed.

### Q: Which LaTeX engine should I use?

A:
- **pdfLaTeX**: Good for most diagrams, fastest
- **LuaLaTeX**: Better support for complex diagrams and Unicode
- **XeLaTeX**: Good for diagrams with custom fonts

### Q: How can I improve rendering performance?

A:
- Enable caching in the plugin settings
- Use simpler diagrams when possible
- Use pdfLaTeX for faster rendering
- Run the server locally for better performance

### Q: How do I start the server?

A: See the [Server Setup Guide](SERVER_SETUP.md) for detailed instructions. In short:
- Navigate to the `src/server` directory
- Run `npm install` to install dependencies
- Run `npm start` to start the server

### Q: Can I use the plugin without running a server?

A: No, the server is required for rendering TikZ diagrams. The server handles the LaTeX compilation and conversion to SVG/PDF. You need to run the server manually before using the plugin.

### Q: How do I include external images in my TikZ diagrams?

A: You can use the `\includegraphics` command from the graphicx package. Add the following to your preamble:

```latex
\usepackage{graphicx}
```

Then in your TikZ code:

```latex
\begin{tikzpicture}
  \node at (0,0) {\includegraphics[width=5cm]{path/to/image}};
\end{tikzpicture}
```

Note that the path is relative to the server's working directory.

### Q: Can I save my TikZ diagrams as separate files?

A: Yes, you can export the rendered diagrams using the toolbar. Click on the format button (SVG/PDF) and then use your browser's save functionality.

### Q: How do I create animations or interactive diagrams?

A: Static animations are not directly supported, but you can create multiple diagrams with slight variations to show progression. For truly interactive diagrams, consider using a JavaScript-based solution alongside this plugin.
