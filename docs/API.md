# TikZ Advanced Plugin API Documentation

This document provides detailed information about the APIs available in the TikZ Advanced Plugin.

## Table of Contents

1. [Client-Side API](#client-side-api)
   - [TikZRenderer](#tikzrenderer)
   - [TikZServerConnector](#tikzserverconnector)
   - [TikZCache](#tikzcache)
   - [TikZSettingTab](#tikzsettingtab)
2. [Server-Side API](#server-side-api)
   - [REST API](#rest-api)
   - [TikZRenderer](#tikzrenderer-server)
   - [LaTeXEngineManager](#latexenginemanager)
   - [SVGOptimizer](#svgoptimizer)
   - [LaTeXErrorParser](#latexerrorparser)
3. [Shared Types](#shared-types)
   - [TikZRenderRequest](#tikzrenderrequest)
   - [TikZRenderResult](#tikzrenderresult)
   - [HealthResponse](#healthresponse)

## Client-Side API

### TikZRenderer

The `TikZRenderer` class is responsible for rendering TikZ diagrams in Obsidian.

```typescript
class TikZRenderer {
  constructor(plugin: TikZAdvancedPlugin);
  
  /**
   * Render a TikZ diagram
   * @param source The TikZ code to render
   * @param containerEl The container element to render the diagram in
   * @param ctx The Markdown post processor context
   */
  async render(
    source: string,
    containerEl: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): Promise<void>;
  
  /**
   * Update the format of a rendered diagram
   * @param source The TikZ code
   * @param contentEl The content element
   * @param errorEl The error element
   * @param cacheIndicator The cache indicator element
   * @param format The output format (svg or pdf)
   */
  private async updateFormat(
    source: string,
    contentEl: HTMLElement,
    errorEl: HTMLElement,
    cacheIndicator: HTMLElement | null,
    format: 'svg' | 'pdf'
  ): Promise<void>;
  
  /**
   * Refresh a rendered diagram
   * @param source The TikZ code
   * @param contentEl The content element
   * @param errorEl The error element
   * @param cacheIndicator The cache indicator element
   */
  private async refreshRender(
    source: string,
    contentEl: HTMLElement,
    errorEl: HTMLElement,
    cacheIndicator: HTMLElement | null
  ): Promise<void>;
}
```

### TikZServerConnector

The `TikZServerConnector` class handles communication with the TikZ server.

```typescript
class TikZServerConnector {
  constructor(plugin: TikZAdvancedPlugin);
  
  /**
   * Test the connection to the TikZ server
   * @returns A promise that resolves to true if the connection is successful
   */
  async testConnection(): Promise<boolean>;
  
  /**
   * Render a TikZ diagram
   * @param source The TikZ code to render
   * @param format The output format (svg or pdf)
   * @param engine The LaTeX engine to use
   * @returns A promise that resolves to the render result
   */
  async renderTikZ(
    source: string,
    format: 'svg' | 'pdf',
    engine: 'pdflatex' | 'lualatex' | 'xelatex'
  ): Promise<TikZRenderResult>;
}
```

### TikZCache

The `TikZCache` class manages caching of rendered TikZ diagrams.

```typescript
class TikZCache {
  constructor(plugin: TikZAdvancedPlugin);
  
  /**
   * Get a cached diagram
   * @param key The cache key
   * @returns The cached diagram or null if not found
   */
  get(key: string): TikZRenderResult | null;
  
  /**
   * Set a cached diagram
   * @param key The cache key
   * @param value The diagram to cache
   */
  set(key: string, value: TikZRenderResult): void;
  
  /**
   * Clear the cache
   */
  clear(): void;
}
```

### TikZSettingTab

The `TikZSettingTab` class handles the plugin settings UI.

```typescript
class TikZSettingTab extends PluginSettingTab {
  constructor(app: App, plugin: TikZAdvancedPlugin);
  
  /**
   * Display the settings tab
   */
  display(): void;
}
```

## Server-Side API

### REST API

#### Health Check

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

#### Render TikZ

```
POST /render
Content-Type: application/json

{
  "tikzCode": "\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}",
  "format": "svg",
  "engine": "pdflatex",
  "preamble": "\\usepackage{tikz}"
}
```

Response (SVG):

```json
{
  "content": "<svg>...</svg>",
  "format": "svg",
  "width": 100,
  "height": 100
}
```

Response (PDF):

```json
{
  "content": "base64-encoded-pdf",
  "format": "pdf"
}
```

Error Response:

```json
{
  "error": "Error message"
}
```

### TikZRenderer (Server)

The server-side `TikZRenderer` class renders TikZ diagrams using LaTeX.

```typescript
class TikZRenderer {
  constructor(config: Config);
  
  /**
   * Render a TikZ diagram
   * @param tikzCode The TikZ code to render
   * @param format The output format (svg or pdf)
   * @param engine The LaTeX engine to use
   * @param preamble The LaTeX preamble
   * @returns A promise that resolves to the render result
   */
  async render(
    tikzCode: string,
    format: 'svg' | 'pdf',
    engine: 'pdflatex' | 'lualatex' | 'xelatex',
    preamble: string
  ): Promise<TikZRenderResult>;
}
```

### LaTeXEngineManager

The `LaTeXEngineManager` class manages LaTeX engines.

```typescript
class LaTeXEngineManager {
  constructor();
  
  /**
   * Check if a LaTeX engine is available
   * @param engine The LaTeX engine to check
   * @returns A promise that resolves to true if the engine is available
   */
  async isEngineAvailable(engine: string): Promise<boolean>;
  
  /**
   * Get all available LaTeX engines
   * @returns A promise that resolves to an object with engine availability
   */
  async getAvailableEngines(): Promise<Record<string, boolean>>;
}
```

### SVGOptimizer

The `SVGOptimizer` class optimizes SVG output.

```typescript
class SVGOptimizer {
  constructor();
  
  /**
   * Optimize an SVG
   * @param svg The SVG to optimize
   * @returns The optimized SVG
   */
  optimize(svg: string): string;
}
```

### LaTeXErrorParser

The `LaTeXErrorParser` class parses and formats LaTeX errors.

```typescript
class LaTeXErrorParser {
  constructor();
  
  /**
   * Parse LaTeX error output
   * @param output The LaTeX error output
   * @returns The parsed error
   */
  parse(output: string): {
    error: string;
    context?: string;
    suggestion?: string;
  };
}
```

## Shared Types

### TikZRenderRequest

```typescript
interface TikZRenderRequest {
  /**
   * The TikZ code to render
   */
  tikzCode: string;
  
  /**
   * The output format (svg or pdf)
   */
  format: 'svg' | 'pdf';
  
  /**
   * The LaTeX engine to use
   */
  engine: 'pdflatex' | 'lualatex' | 'xelatex';
  
  /**
   * The LaTeX preamble
   */
  preamble: string;
  
  /**
   * The source of the request (client identifier)
   */
  source?: string;
}
```

### TikZRenderResult

```typescript
interface TikZRenderResult {
  /**
   * The rendered content (SVG or base64-encoded PDF)
   */
  content: string;
  
  /**
   * The output format
   */
  format: 'svg' | 'pdf';
  
  /**
   * The width of the rendered diagram (for SVG)
   */
  width?: number;
  
  /**
   * The height of the rendered diagram (for SVG)
   */
  height?: number;
  
  /**
   * Error message if rendering failed
   */
  error?: string;
  
  /**
   * Whether the rendering was successful
   */
  success: boolean;
}
```

### HealthResponse

```typescript
interface HealthResponse {
  /**
   * The status of the server
   */
  status: 'ok' | 'error';
  
  /**
   * The version of the server
   */
  version: string;
  
  /**
   * Available LaTeX engines
   */
  engines: {
    pdflatex: boolean;
    lualatex: boolean;
    xelatex: boolean;
  };
}
```
