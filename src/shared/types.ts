/**
 * Request to render a TikZ diagram
 */
export interface TikZRenderRequest {
  tikzCode?: string;
  source?: string;  // Alternative name for tikzCode used by the Obsidian plugin
  format?: 'svg' | 'pdf';
  engine?: 'pdflatex' | 'lualatex' | 'xelatex';
  preamble?: string;
}

/**
 * Result of rendering a TikZ diagram
 */
export interface TikZRenderResult {
  content: string; // Base64 encoded content for PDF, SVG string for SVG
  format: 'svg' | 'pdf';
  width?: number;
  height?: number;
  success?: boolean;
  error?: string;
}

/**
 * Error information for LaTeX errors
 */
export interface LaTeXErrorInfo {
  message: string;
  line?: number;
  context?: string;
  errorType?: string;
  suggestion?: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Error response from the server
 */
export interface TikZErrorResponse {
  error: string;
  errorInfo?: LaTeXErrorInfo;
  errorHTML?: string;
  errorType?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Server health response
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  engines: {
    pdflatex: boolean;
    lualatex: boolean;
    xelatex: boolean;
  };
}
