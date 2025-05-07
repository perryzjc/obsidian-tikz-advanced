/**
 * Server configuration
 */
export const config = {
  // Server port
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,

  // Maximum request size in bytes (10MB)
  maxRequestSize: '10mb',

  // Temporary directory for rendering
  tempDir: process.env.TEMP_DIR || 'tmp',

  // Default LaTeX engine
  defaultEngine: process.env.DEFAULT_ENGINE || 'pdflatex',

  // Default output format
  defaultFormat: process.env.DEFAULT_FORMAT || 'svg',

  // Default preamble
  defaultPreamble: `\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage{amsmath}
\\usepackage{amssymb}`,

  // Timeout for LaTeX compilation in milliseconds (30 seconds)
  compilationTimeout: 30000,

  // Enable CORS
  enableCors: true,

  // Allowed origins for CORS (empty array means all origins)
  corsOrigins: [],

  // Log level
  logLevel: process.env.LOG_LEVEL || 'info',

  // Enable progressive rendering
  enableProgressiveRendering: process.env.ENABLE_PROGRESSIVE_RENDERING !== 'false',

  // Enable smart preprocessing
  enableSmartPreprocessing: process.env.ENABLE_SMART_PREPROCESSING !== 'false',

  // Maximum number of rendering attempts for progressive rendering
  maxRenderingAttempts: process.env.MAX_RENDERING_ATTEMPTS ? parseInt(process.env.MAX_RENDERING_ATTEMPTS) : 4,
};
