/**
 * Utility for parsing and formatting LaTeX errors
 */
export interface LaTeXError {
  message: string;
  line?: number;
  context?: string;
  errorType?: string;
  suggestion?: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
  progressiveNote?: string;
  syntaxFixNote?: string;
}

export class LaTeXErrorParser {
  /**
   * Extract error message from LaTeX output
   */
  static extractError(output: string): LaTeXError {
    // Common error patterns
    const errorPatterns = [
      // Pattern for undefined control sequence
      {
        regex: /! Undefined control sequence\.\s*[^\n]*\\([^\s]+)\s*l\.(\d+)/,
        extract: (match: RegExpMatchArray) => {
          // Extract the raw error message from the output
          const rawErrorMessage = this.extractRawErrorMessage(output, match.index || 0);

          // Get the command name
          const command = match[1];

          // Provide specific suggestions based on the command
          let suggestion = `The command \\${command} is not recognized. Check for typos or make sure you've loaded the required package.`;

          // Check for common TikZ/PGF commands and suggest libraries
          if (/^(edge|plate|factor|latent|obs)$/.test(command)) {
            suggestion = `The command \\${command} requires the bayesnet library. Add \\usetikzlibrary{bayesnet} to your preamble.`;
          } else if (/^(state|accepting|initial)$/.test(command)) {
            suggestion = `The command \\${command} requires the automata library. Add \\usetikzlibrary{automata} to your preamble.`;
          } else if (/^(cylinder|ellipse|diamond|star|regular)$/.test(command)) {
            suggestion = `The shape \\${command} requires the shapes.geometric library. Add \\usetikzlibrary{shapes.geometric} to your preamble.`;
          } else if (/^(addplot|axis|semilogxaxis|semilogyaxis|loglogaxis)$/.test(command)) {
            suggestion = `The command \\${command} requires the pgfplots package. Add \\usepackage{pgfplots} to your preamble.`;
          } else if (/^(matrix|m)$/.test(command)) {
            suggestion = `The command \\${command} for matrix of nodes requires the matrix library. Add \\usetikzlibrary{matrix} to your preamble.`;
          } else if (/^(spy|magnify)$/.test(command)) {
            suggestion = `The command \\${command} requires the spy library. Add \\usetikzlibrary{spy} to your preamble.`;
          } else if (/^(decorate|decoration)$/.test(command)) {
            suggestion = `The command \\${command} requires a decorations library. Add \\usetikzlibrary{decorations.pathmorphing} or another decorations library to your preamble.`;
          } else if (/^(fit)$/.test(command)) {
            suggestion = `The command \\${command} requires the fit library. Add \\usetikzlibrary{fit} to your preamble.`;
          } else if (/^(graph|Graph)$/.test(command)) {
            suggestion = `The command \\${command} requires the graphs library. Add \\usetikzlibrary{graphs} to your preamble.`;
          } else if (/^(Stealth|Latex|Computer)$/.test(command)) {
            suggestion = `The arrow tip \\${command} requires the arrows.meta library. Add \\usetikzlibrary{arrows.meta} to your preamble.`;
          } else if (/^(above|below|left|right)$/.test(command)) {
            suggestion = `The positioning command \\${command} requires the positioning library. Add \\usetikzlibrary{positioning} to your preamble.`;
          } else if (/^(siunitx|SI|si|celsius|ohm)$/.test(command)) {
            suggestion = `The command \\${command} requires the siunitx package. Add \\usepackage{siunitx} to your preamble.`;
          } else if (/^(mathbb|mathfrak|mathcal)$/.test(command)) {
            suggestion = `The math command \\${command} requires the amssymb package. Add \\usepackage{amssymb} to your preamble.`;
          } else if (/^(align|gather|multline|tag)$/.test(command)) {
            suggestion = `The math environment \\${command} requires the amsmath package. Add \\usepackage{amsmath} to your preamble.`;
          }

          return {
            // Use the raw error message if available, otherwise format it
            message: rawErrorMessage || `Undefined control sequence: \\${command}`,
            line: parseInt(match[2]),
            context: this.extractContextAroundLine(output, match.index || 0),
            errorType: 'UndefinedControlSequence',
            suggestion: suggestion,
            code: `\\${command}`,
            severity: 'error' as 'error'
          };
        }
      },
      // Fallback for undefined control sequence without specific command
      {
        regex: /! Undefined control sequence\.\s*[^\n]*\s*l\.(\d+)/,
        extract: (match: RegExpMatchArray) => ({
          message: 'Undefined control sequence',
          line: parseInt(match[1]),
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'UndefinedControlSequence',
          suggestion: 'A command in your TikZ code is not recognized. Check for typos or make sure you\'ve loaded the required package.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for missing $ error
      {
        regex: /! Missing \$ inserted\.\s*[^\n]*\s*l\.(\d+)/,
        extract: (match: RegExpMatchArray) => ({
          message: 'Missing $ inserted (math mode error)',
          line: parseInt(match[1]),
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'MathModeError',
          suggestion: 'You\'re using math commands outside of math mode. Enclose them in $...$ or use \\(...\\) for inline math.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for missing } error
      {
        regex: /! Missing [}] inserted\.\s*[^\n]*\s*l\.(\d+)/,
        extract: (match: RegExpMatchArray) => ({
          message: 'Missing } inserted (unclosed group)',
          line: parseInt(match[1]),
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'UnclosedGroup',
          suggestion: 'You have an unclosed group. Check for missing closing braces } in your code.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for missing package error
      {
        regex: /! LaTeX Error: File [`']([^']+)[`'] not found/,
        extract: (match: RegExpMatchArray) => ({
          message: `Package not found: ${match[1]}`,
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'MissingPackage',
          suggestion: `The package ${match[1]} is not installed. Add it to your LaTeX distribution or check the package name for typos.`,
          code: match[1],
          severity: 'error' as 'error'
        })
      },
      // Pattern for no line here to end error
      {
        regex: /! LaTeX Error: There's no line here to end\.\s*[^\n]*\s*l\.(\d+)/,
        extract: (match: RegExpMatchArray) => ({
          message: 'There\'s no line here to end',
          line: parseInt(match[1]),
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'NoLineToEnd',
          suggestion: 'You might have an empty line or a command that expects text but found none. Check your TikZ syntax.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for "Can be used only in preamble" error
      {
        regex: /Error: ([^:]+): Can be used only in preamble/,
        extract: (match: RegExpMatchArray) => ({
          message: `${match[1]}: Can be used only in preamble`,
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'PreambleOnlyCommand',
          suggestion: 'This command can only be used in the document preamble (before \\begin{document}). In TikZ diagrams, you may need to use a different approach or load packages differently.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for pgfplots errors
      {
        regex: /Package pgfplots (?:Error|Warning): ([^\n]+)/,
        extract: (match: RegExpMatchArray) => ({
          message: `PGFPlots: ${match[1]}`,
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'PGFPlotsError',
          suggestion: 'Check your pgfplots syntax or version compatibility. You might need to update your pgfplots package or adjust your syntax.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for missing begin{document}
      {
        regex: /! LaTeX Error: Missing \\begin{document}/,
        extract: (match: RegExpMatchArray) => ({
          message: 'Missing \\begin{document}',
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'MissingBeginDocument',
          suggestion: 'The TikZ server automatically adds document structure, but you might have text outside of proper LaTeX environments.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for dimension too large
      {
        regex: /! Dimension too large\.\s*[^\n]*\s*l\.(\d+)/,
        extract: (match: RegExpMatchArray) => ({
          message: 'Dimension too large',
          line: parseInt(match[1]),
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'DimensionTooLarge',
          suggestion: 'You\'ve specified a dimension that\'s too large for TeX to handle. Check your coordinate values or scaling factors.',
          severity: 'error' as 'error'
        })
      },
      // Pattern for runaway argument
      {
        regex: /Runaway argument\?/,
        extract: (match: RegExpMatchArray) => {
          // Try to extract the environment name from the paragraph ended message
          const paragraphEndedMatch = output.match(/Paragraph ended before ([^\n]+) was complete/);
          const envName = paragraphEndedMatch ? paragraphEndedMatch[1] : 'environment';

          return {
            message: `Runaway argument - unclosed ${envName}`,
            context: this.extractContextAroundLine(output, match.index || 0),
            errorType: 'RunawayArgument',
            suggestion: `Check for missing closing braces or unclosed environments. Make sure all your environments (like tikzpicture, axis) are properly closed.`,
            severity: 'error' as 'error'
          };
        }
      },
      // Pattern for paragraph ended before environment was complete
      {
        regex: /Paragraph ended before ([^\n]+) was complete/,
        extract: (match: RegExpMatchArray) => {
          const envName = match[1];
          let suggestion = 'Check for missing closing braces or semicolons.';

          if (envName.includes('pgfplots')) {
            suggestion = 'Make sure your PGFPlots environments are properly closed and don\'t contain blank lines. Each \\addplot command should end with a semicolon.';
          } else if (envName.includes('tikzpicture')) {
            suggestion = 'Make sure your TikZ picture environment is properly closed and all commands end with semicolons.';
          } else if (envName.includes('axis')) {
            suggestion = 'Make sure your axis environment is properly closed with \\end{axis} and all \\addplot commands end with semicolons.';
          }

          return {
            message: `Paragraph ended before ${envName} was complete`,
            context: this.extractContextAroundLine(output, match.index || 0),
            errorType: 'ParagraphEndedBeforeComplete',
            suggestion,
            severity: 'error' as 'error'
          };
        }
      },
      // Pattern for general LaTeX errors
      {
        regex: /! LaTeX Error: ([^\n]+)/,
        extract: (match: RegExpMatchArray) => ({
          message: match[1],
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'LaTeXError',
          severity: 'error' as 'error'
        })
      },
      // Pattern for general errors
      {
        regex: /! ([^\n]+)/,
        extract: (match: RegExpMatchArray) => ({
          message: match[1],
          context: this.extractContextAroundLine(output, match.index || 0),
          errorType: 'GeneralError',
          severity: 'error' as 'error'
        })
      }
    ];

    // Try each pattern
    for (const pattern of errorPatterns) {
      const match = output.match(pattern.regex);
      if (match) {
        return pattern.extract(match);
      }
    }

    // If no specific error pattern matches, return a generic error
    return {
      message: 'LaTeX compilation failed',
      context: this.extractLastLines(output, 10),
      errorType: 'GenericError',
      severity: 'error' as 'error'
    };
  }

  /**
   * Extract the raw error message from the LaTeX output
   * This gets the exact error message as reported by LaTeX
   */
  private static extractRawErrorMessage(output: string, position: number): string {
    // Find the start of the error line (marked with !)
    const errorLineStart = output.lastIndexOf('!', position);
    if (errorLineStart === -1) {
      // If no ! is found, look for common error patterns
      if (output.includes('Runaway argument?')) {
        return '! Runaway argument - unclosed environment or missing closing brace';
      }
      if (output.includes('Paragraph ended before')) {
        const match = output.match(/Paragraph ended before ([^\n]+) was complete/);
        if (match) {
          return `! Paragraph ended before ${match[1]} was complete - check for missing closing braces or semicolons`;
        }
        return '! Paragraph ended before environment was complete - check for missing closing braces or semicolons';
      }
      return '';
    }

    // Find the end of the error line (next newline)
    const errorLineEnd = output.indexOf('\n', errorLineStart);
    if (errorLineEnd === -1) return output.substring(errorLineStart);

    // Extract the error line and remove the leading !
    const errorLine = output.substring(errorLineStart, errorLineEnd).trim();
    return errorLine;
  }

  /**
   * Extract context around a specific position in the output
   */
  private static extractContextAroundLine(output: string, position: number, lines = 5): string {
    // Find the start of the line containing the error
    let start = output.lastIndexOf('\n', position);
    if (start === -1) start = 0;

    // Find a few lines before
    for (let i = 0; i < lines; i++) {
      const prevStart = output.lastIndexOf('\n', start - 1);
      if (prevStart === -1) break;
      start = prevStart;
    }

    // Find a few lines after
    let end = position;
    for (let i = 0; i < lines; i++) {
      const nextEnd = output.indexOf('\n', end + 1);
      if (nextEnd === -1) {
        end = output.length;
        break;
      }
      end = nextEnd;
    }

    return output.substring(start + 1, end).trim();
  }

  /**
   * Extract the last n lines of output
   */
  private static extractLastLines(output: string, lines: number): string {
    const allLines = output.split('\n');
    return allLines.slice(-lines).join('\n');
  }

  /**
   * Format error for user-friendly display
   */
  static formatError(error: LaTeXError): string {
    let formattedError = `Error: ${error.message}`;

    if (error.line) {
      formattedError += `\nLine: ${error.line}`;
    }

    if (error.suggestion) {
      formattedError += `\n\nSuggestion: ${error.suggestion}`;
    }

    if (error.context) {
      formattedError += `\n\nContext:\n${error.context}`;
    }

    if (error.progressiveNote) {
      formattedError += `\n\nNote: ${error.progressiveNote}`;
    }

    if (error.syntaxFixNote) {
      formattedError += `\n\nSyntax Fix: ${error.syntaxFixNote}`;
    }

    return formattedError;
  }

  /**
   * Format error as HTML for display in the UI
   */
  static formatErrorHTML(error: LaTeXError): string {
    // Escape HTML in the error message and other text fields
    const escapeHtml = (text: string) => {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let html = `<div class="tikz-error-container">`;

    // Error header with severity icon
    const severityClass = error.severity || 'error';
    html += `<div class="tikz-error-header ${severityClass}">`;
    html += `<span class="tikz-error-icon"></span>`;
    html += `<span class="tikz-error-title">TikZ Error</span>`;
    html += `<span class="tikz-error-toggle">▼</span>`;
    html += `</div>`;

    // Main error message section - make it more prominent for specific errors
    const isSpecificError = error.errorType && error.errorType !== 'GenericError';
    html += `<div class="tikz-error-message ${isSpecificError ? 'specific-error' : ''}">${escapeHtml(error.message)}</div>`;

    // Error details in collapsible section
    html += `<div class="tikz-error-details">`;

    if (error.line) {
      html += `<div class="tikz-error-line">Line: ${error.line}</div>`;
    }

    if (error.suggestion) {
      html += `<div class="tikz-error-suggestion"><strong>Suggestion:</strong> ${escapeHtml(error.suggestion)}</div>`;
    }

    if (error.code) {
      html += `<div class="tikz-error-code"><strong>Problematic code:</strong> <code>${escapeHtml(error.code)}</code></div>`;
    }

    if (error.context) {
      html += `<div class="tikz-error-context"><strong>Context:</strong><pre>${escapeHtml(error.context)}</pre></div>`;
    }

    html += `</div>`; // Close details

    // Add progressive rendering note if available
    if (error.progressiveNote) {
      html += `<div class="tikz-error-progressive-note">${escapeHtml(error.progressiveNote)}</div>`;
    }

    // Add syntax fix note if available
    if (error.syntaxFixNote) {
      html += `<div class="tikz-error-syntax-fix-note">${escapeHtml(error.syntaxFixNote)}</div>`;
    }

    // Add a note about checking server logs
    html += `<div class="tikz-error-note">For more details, check the server logs or try running the TikZ code in a LaTeX editor.</div>`;

    html += `</div>`; // Close container

    return html;
  }
}
