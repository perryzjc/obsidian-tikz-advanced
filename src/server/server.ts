import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { TikZRenderer } from './tikzRenderer';
import { TikZRenderRequest, HealthResponse } from '../shared/types';
import { checkDependencies } from './dependencyChecker';
import { Logger } from '../shared/logger';
import { LaTeXEngineManager } from './latexEngineManager';
import { LaTeXErrorParser } from './latexErrorParser';
import { config } from './config';

const logger = new Logger('TikZServer');
const app = express();
const port = config.port;

// Middleware
if (config.enableCors) {
  const corsOptions = {
    origin: config.corsOrigins.length ? config.corsOrigins : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  app.use(cors(corsOptions));
  logger.info('CORS enabled');
}

app.use(bodyParser.json({ limit: config.maxRequestSize }));
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Create renderer with configuration
const renderer = new TikZRenderer({
  enableProgressiveRendering: config.enableProgressiveRendering,
  maxRenderingAttempts: config.maxRenderingAttempts // Limit attempts to prevent infinite recursion
});

// Initialize the LaTeX engine manager
const engineManager = new LaTeXEngineManager();
engineManager.initialize().then(() => {
  logger.info('LaTeX engine manager initialized');
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dependencies = await checkDependencies();

    const response: HealthResponse = {
      status: 'ok',
      version: '1.0.0',
      engines: {
        pdflatex: dependencies.pdflatex,
        lualatex: dependencies.lualatex,
        xelatex: dependencies.xelatex
      }
    };

    logger.info('Health check successful', response);
    res.json(response);
  } catch (error: any) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message || 'Unknown error'
    });
  }
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'TikZ Advanced Server'
  });
});

// Render endpoint
app.post('/render', async (req, res) => {
  const startTime = Date.now();
  try {
    const request: TikZRenderRequest = req.body;

    // Support both 'tikzCode' and 'source' parameters for compatibility
    const tikzCode = request.tikzCode || request.source;

    if (!tikzCode) {
      logger.warn('Missing tikzCode in request');
      return res.status(400).json({
        error: 'Missing tikzCode in request',
        success: false,
        details: {
          suggestion: 'Make sure your TikZ code block is not empty.'
        },
        errorHTML: `<div class="tikz-error-container"><div class="tikz-error-header error"><span class="tikz-error-icon"></span><span class="tikz-error-title">TikZ Error</span><span class="tikz-error-toggle">▼</span></div><div class="tikz-error-message">Missing tikzCode in request</div><div class="tikz-error-details"><div class="tikz-error-suggestion"><strong>Suggestion:</strong> Make sure your TikZ code block is not empty.</div></div><div class="tikz-error-note">For more details, check the server logs or try running the TikZ code in a LaTeX editor.</div></div>`
      });
    }

    // Update the request object to use the tikzCode we found
    request.tikzCode = tikzCode;

    logger.info(`Rendering TikZ diagram (${request.tikzCode.length} bytes) with format=${request.format || 'svg'}, engine=${request.engine || 'pdflatex'}`);

    // Add a safeguard against potential infinite recursion
    const maxRenderingAttempts = 4; // Maximum number of rendering strategies to try

    // Debug log the actual TikZ code and preamble
    if (config.logLevel === 'debug') {
      logger.debug('TikZ Code:', request.tikzCode);
      logger.debug('Preamble:', request.preamble || config.defaultPreamble);
    }

    const result = await renderer.render(
      request.tikzCode,
      request.format || config.defaultFormat as 'svg' | 'pdf',
      request.engine || config.defaultEngine as 'pdflatex' | 'lualatex' | 'xelatex',
      request.preamble || config.defaultPreamble
    );

    const duration = Date.now() - startTime;
    logger.info(`Rendering completed in ${duration}ms`);

    res.json(result);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`Rendering failed after ${duration}ms:`, error);

    // Create a detailed error response
    const errorResponse: any = {
      error: error.message || 'Unknown rendering error',
      success: false
    };

    // If the error has structured error information from LaTeXErrorParser
    if (error.errorInfo) {
      // Use the structured error info
      errorResponse.errorInfo = error.errorInfo;

      // Add the HTML formatted error
      if (error.errorHTML) {
        errorResponse.errorHTML = error.errorHTML;
      }
    } else {
      // Create a basic error info object
      errorResponse.errorInfo = {
        message: error.message || 'Unknown rendering error',
        errorType: error.name || 'Error',
        severity: 'error',
        context: error.context || '',
        code: error.code || '',
        suggestion: ''
      };

      // Get the TikZ code from the request
      const tikzCode = req.body.tikzCode || req.body.source || '';

      // Check if this is an error with errorInfo (from progressive rendering or direct rendering)
      if (error.errorInfo) {
        // Use the original error message - this is the specific LaTeX error
        errorResponse.error = error.message;

        // Make sure the errorInfo message matches the original error message
        error.errorInfo.message = error.message;

        // Use the structured error info
        errorResponse.errorInfo = error.errorInfo;

        // Add a note about progressive rendering if not already present
        if (!error.errorInfo.progressiveNote && error.message.includes('multiple attempts')) {
          errorResponse.errorInfo.progressiveNote =
            "Multiple rendering strategies were attempted but all failed.";
        }

        // Add the HTML formatted error if available
        if (error.errorHTML) {
          errorResponse.errorHTML = error.errorHTML;
        } else {
          // Generate HTML from the error info
          errorResponse.errorHTML = LaTeXErrorParser.formatErrorHTML(errorResponse.errorInfo);
        }

        // Return early to avoid overwriting with generic error
        return res.status(200).json(errorResponse);
      }

      // Add suggestion based on error type and content
      if (error.message.includes('Missing tikzCode')) {
        errorResponse.errorInfo.suggestion = 'Make sure your TikZ code block is not empty.';
      } else if (error.message.includes('preamble')) {
        errorResponse.errorInfo.suggestion = 'This command can only be used in the document preamble. In TikZ diagrams, you may need to use a different approach.';
      } else if (error.message.includes('Undefined control sequence')) {
        // Check for specific undefined commands
        const undefinedCommand = error.message.match(/Undefined control sequence[^\\]*(\\[a-zA-Z]+)/);
        if (undefinedCommand && undefinedCommand[1]) {
          const command = undefinedCommand[1].replace('\\', '');

          // Use the tikzPreprocessor to suggest libraries
          const suggestions = renderer.tikzPreprocessor.suggestLibraries(error.message);

          if (suggestions.libraries.length > 0 || suggestions.packages.length > 0) {
            let suggestionText = `The command \\${command} is not recognized. `;

            if (suggestions.libraries.length > 0) {
              suggestionText += `Try adding \\usetikzlibrary{${suggestions.libraries.join(', ')}} to your preamble. `;
            }

            if (suggestions.packages.length > 0) {
              suggestionText += `Try adding \\usepackage{${suggestions.packages.join(', ')}} to your preamble.`;
            }

            errorResponse.errorInfo.suggestion = suggestionText;
          } else if (command === 'celsius' || command === 'textcelsius') {
            errorResponse.errorInfo.suggestion = 'The \\celsius or \\textcelsius command requires the siunitx package. Try adding "\\usepackage{siunitx}" to your preamble, or use $^{\\circ}$C instead.';
          } else if (command === 'addplot' || command === 'axis') {
            errorResponse.errorInfo.suggestion = 'You are using PGFPlots commands. Make sure to add "\\usepackage{pgfplots}\\pgfplotsset{compat=1.18}" to your preamble.';
          } else {
            errorResponse.errorInfo.suggestion = `The command \\${command} is not recognized. Check for typos or make sure you've loaded the required package.`;
          }
        } else {
          errorResponse.errorInfo.suggestion = 'Check for typos or make sure you\'ve loaded the required package.';
        }
      } else if (error.message.includes('Missing $')) {
        errorResponse.errorInfo.suggestion = 'You\'re using math commands outside of math mode. Enclose them in $...$ or use \\(...\\) for inline math.';
      } else if (error.message.includes('File not found')) {
        // Use the tikzPreprocessor to suggest packages
        const suggestions = renderer.tikzPreprocessor.suggestLibraries(error.message);

        if (suggestions.packages.length > 0) {
          errorResponse.errorInfo.suggestion = `The required package is not installed. Try adding \\usepackage{${suggestions.packages.join(', ')}} to your preamble.`;
        } else {
          errorResponse.errorInfo.suggestion = 'The required package or file is not installed. Check the package name for typos.';
        }
      } else if (error.message.includes('Paragraph ended before')) {
        // Check for specific environment issues
        if (error.message.includes('axis')) {
          errorResponse.errorInfo.suggestion = 'The axis environment was not properly closed or contains blank lines. Make sure to remove blank lines inside the axis environment and check for missing closing braces.';
        } else if (error.message.includes('tikzpicture')) {
          errorResponse.errorInfo.suggestion = 'The tikzpicture environment was not properly closed or contains syntax errors. Check for missing closing braces or semicolons.';
        } else {
          errorResponse.errorInfo.suggestion = 'An environment was not properly closed. Check for missing closing braces or remove blank lines inside environments.';
        }
      } else {
        // Use the tikzPreprocessor to suggest libraries for other errors
        const suggestions = renderer.tikzPreprocessor.suggestLibraries(error.message);

        if (suggestions.libraries.length > 0 || suggestions.packages.length > 0) {
          let suggestionText = 'Check your TikZ syntax. ';

          if (suggestions.libraries.length > 0) {
            suggestionText += `You might need to add \\usetikzlibrary{${suggestions.libraries.join(', ')}} to your preamble. `;
          }

          if (suggestions.packages.length > 0) {
            suggestionText += `You might need to add \\usepackage{${suggestions.packages.join(', ')}} to your preamble.`;
          }

          errorResponse.errorInfo.suggestion = suggestionText;
        } else {
          errorResponse.errorInfo.suggestion = 'Check your TikZ syntax or try running the code in a LaTeX editor for more details.';
        }
      }

      // Extract context from error message if available
      const contextMatch = error.message.match(/Context:\s*\(([^)]+)\)/);
      if (contextMatch) {
        errorResponse.errorInfo.context = contextMatch[1];
      }

      // Generate HTML error display
      errorResponse.errorHTML = `
        <div class="tikz-error-container">
          <div class="tikz-error-header error">
            <span class="tikz-error-icon"></span>
            <span class="tikz-error-title">TikZ Error</span>
            <span class="tikz-error-toggle">▼</span>
          </div>
          <div class="tikz-error-message specific-error">${errorResponse.errorInfo.message}</div>
          <div class="tikz-error-details">
            ${errorResponse.errorInfo.suggestion ?
              `<div class="tikz-error-suggestion"><strong>Suggestion:</strong> ${errorResponse.errorInfo.suggestion}</div>` : ''}
            ${errorResponse.errorInfo.context ?
              `<div class="tikz-error-context"><strong>Context:</strong><pre>${errorResponse.errorInfo.context}</pre></div>` : ''}
          </div>
          <div class="tikz-error-note">For more details, check the server logs or try running the TikZ code in a LaTeX editor.</div>
        </div>
      `;
    }

    // Log the error for debugging
    logger.debug('Sending error response:', errorResponse);

    // Send the response with status 200 to ensure it's properly parsed
    res.status(200).json(errorResponse);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(port, () => {
  logger.info(`TikZ server listening at http://localhost:${port}`);
  logger.info(`Default engine: ${config.defaultEngine}`);
  logger.info(`Default format: ${config.defaultFormat}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
