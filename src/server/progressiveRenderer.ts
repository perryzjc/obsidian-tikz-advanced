import { Logger } from '../shared/logger';
import { TikZRenderer } from './tikzRenderer';
import { TikZRenderResult } from '../shared/types';
import { TikZPreprocessor } from './tikzPreprocessor';
import { LaTeXErrorParser } from './latexErrorParser';

/**
 * Progressive Renderer
 *
 * This class implements a progressive rendering approach that tries multiple
 * strategies to render TikZ code, improving the success rate.
 */
export class ProgressiveRenderer {
  private logger: Logger;
  private renderer: TikZRenderer;
  private preprocessor: TikZPreprocessor;
  private maxAttempts: number = 4;

  constructor(renderer: TikZRenderer, maxAttempts?: number) {
    this.logger = new Logger('ProgressiveRenderer');
    this.renderer = renderer;
    this.preprocessor = new TikZPreprocessor();

    if (maxAttempts !== undefined && maxAttempts > 0) {
      this.maxAttempts = maxAttempts;
    }
  }

  /**
   * Render TikZ code using a progressive approach
   *
   * @param tikzCode The TikZ code to render
   * @param format The output format (svg or pdf)
   * @param engine The LaTeX engine to use
   * @param preamble The LaTeX preamble
   * @returns The rendering result
   */
  async render(
    tikzCode: string,
    format: 'svg' | 'pdf',
    engine: 'pdflatex' | 'lualatex' | 'xelatex',
    preamble: string
  ): Promise<TikZRenderResult> {
    this.logger.info('Starting progressive rendering with max attempts: ' + this.maxAttempts);

    // Track the number of attempts
    let attemptCount = 0;

    // Track the most informative error
    let mostInformativeError: any = null;

    // Strategy 1: Try rendering the code as-is with the provided preamble
    attemptCount++;
    try {
      this.logger.debug('Strategy 1: Rendering code as-is');
      // Use renderDirect to avoid infinite recursion
      const result = await this.renderer.renderDirect(tikzCode, format, engine, preamble);
      this.logger.info('Strategy 1 succeeded');
      return result;
    } catch (error: any) {
      this.logger.debug(`Strategy 1 failed: ${error.message}`);

      // Extract error information for better diagnostics
      const errorInfo = error.errorInfo || LaTeXErrorParser.extractError(error.message || '');
      this.logger.debug('Error type:', errorInfo.errorType || 'unknown');

      // Store this as our most informative error so far
      mostInformativeError = error;

      // Check if we've reached the maximum number of attempts
      if (attemptCount >= this.maxAttempts) {
        this.logger.warn(`Reached maximum number of attempts (${this.maxAttempts}), stopping progressive rendering`);
        throw error;
      }

      // Strategy 2: Try with preprocessed code but original preamble
      attemptCount++;
      try {
        this.logger.debug('Strategy 2: Using preprocessed code with original preamble');
        const { processedCode, documentStructureAdded, fixedSyntaxIssues } = this.preprocessor.preprocess(tikzCode, preamble);

        // Only proceed if preprocessing actually changed something
        if (processedCode !== tikzCode || documentStructureAdded || fixedSyntaxIssues) {
          const result = await this.renderer.renderDirect(processedCode, format, engine, preamble);
          this.logger.info('Strategy 2 succeeded');
          return result;
        } else {
          this.logger.debug('Preprocessing did not change the code, skipping Strategy 2');
        }
      } catch (error2: any) {
        this.logger.debug(`Strategy 2 failed: ${error2.message}`);

        // Update most informative error if this one is better
        if (this.isMoreInformativeError(error2, mostInformativeError)) {
          this.logger.debug('Strategy 2 error is more informative, updating');
          mostInformativeError = error2;
        }

        // Check if we've reached the maximum number of attempts
        if (attemptCount >= this.maxAttempts) {
          this.logger.warn(`Reached maximum number of attempts (${this.maxAttempts}), stopping progressive rendering`);
          throw mostInformativeError || error2;
        }

        // Strategy 3: Try with original code but enhanced preamble
        attemptCount++;
        try {
          this.logger.debug('Strategy 3: Using original code with enhanced preamble');
          const { enhancedPreamble } = this.preprocessor.preprocess(tikzCode, preamble);

          // Only proceed if the preamble was enhanced
          if (enhancedPreamble !== preamble) {
            const result = await this.renderer.renderDirect(tikzCode, format, engine, enhancedPreamble);
            this.logger.info('Strategy 3 succeeded');
            return result;
          } else {
            this.logger.debug('Preamble was not enhanced, skipping Strategy 3');
          }
        } catch (error3: any) {
          this.logger.debug(`Strategy 3 failed: ${error3.message}`);

          // Update most informative error if this one is better
          if (this.isMoreInformativeError(error3, mostInformativeError)) {
            this.logger.debug('Strategy 3 error is more informative, updating');
            mostInformativeError = error3;
          }

          // Check if we've reached the maximum number of attempts
          if (attemptCount >= this.maxAttempts) {
            this.logger.warn(`Reached maximum number of attempts (${this.maxAttempts}), stopping progressive rendering`);
            throw mostInformativeError || error3;
          }

          // Strategy 4: Try with both preprocessed code and enhanced preamble
          attemptCount++;
          try {
            this.logger.debug('Strategy 4: Using preprocessed code with enhanced preamble');
            const { processedCode, enhancedPreamble, fixedSyntaxIssues } = this.preprocessor.preprocess(tikzCode, preamble);

            if (fixedSyntaxIssues) {
              this.logger.info('Fixed common syntax issues in TikZ code during Strategy 4');
            }

            const result = await this.renderer.renderDirect(processedCode, format, engine, enhancedPreamble);
            this.logger.info('Strategy 4 succeeded');
            return result;
          } catch (error4: any) {
            this.logger.debug(`Strategy 4 failed: ${error4.message}`);

            // Update most informative error if this one is better
            if (this.isMoreInformativeError(error4, mostInformativeError)) {
              this.logger.debug('Strategy 4 error is more informative, updating');
              mostInformativeError = error4;
            }

            // If all strategies fail, use the most informative error
            this.logger.error('All rendering strategies failed');

            // If we have a most informative error, enhance it with additional suggestions
            if (mostInformativeError && mostInformativeError.errorInfo) {
              // Preserve the original error message
              const originalMessage = mostInformativeError.message;

              // Make sure the errorInfo message matches the original error message
              // This ensures the specific error (like "Undefined control sequence \dr12aw") is preserved
              mostInformativeError.errorInfo.message = originalMessage;

              // Add a suggestion if not already present
              if (!mostInformativeError.errorInfo.suggestion) {
                mostInformativeError.errorInfo.suggestion = this.getSuggestionForError(
                  mostInformativeError.errorInfo,
                  tikzCode
                );
              }

              // Add a note about progressive rendering
              mostInformativeError.errorInfo.progressiveNote =
                "Multiple rendering strategies were attempted but all failed. " +
                "The error shown is from the most informative attempt.";

              // Check if we fixed syntax issues during preprocessing
              const { fixedSyntaxIssues } = this.preprocessor.preprocess(tikzCode, preamble);
              if (fixedSyntaxIssues) {
                // Add a note about automatic syntax fixes
                mostInformativeError.errorInfo.syntaxFixNote =
                  "Some common syntax issues were automatically fixed during rendering attempts, " +
                  "but the error persisted. Check for more complex syntax problems.";
              }

              // Regenerate the error HTML with the updated information
              mostInformativeError.errorHTML = LaTeXErrorParser.formatErrorHTML(mostInformativeError.errorInfo);

              // Just throw the original error with enhanced information
              throw mostInformativeError;
            }

            // If we don't have a most informative error, enhance the original error
            if (errorInfo.errorType) {
              // Preserve the original error message
              const originalMessage = error.message;

              // Make sure the errorInfo message matches the original error message
              errorInfo.message = originalMessage;

              errorInfo.suggestion = this.getSuggestionForError(errorInfo, tikzCode);
              errorInfo.progressiveNote = "Multiple rendering strategies were attempted but all failed.";

              // Enhance the original error with additional information
              error.errorInfo = errorInfo;
              error.errorHTML = LaTeXErrorParser.formatErrorHTML(errorInfo);
              throw error;
            }

            // Last resort: throw the original error with its original message
            throw error;
          }
        }
      }
    }

    // This should never be reached, but TypeScript requires a return statement
    // Use the original error message if available, otherwise use a generic message
    if (mostInformativeError && mostInformativeError.message) {
      throw mostInformativeError;
    } else {
      throw new Error('Failed to render TikZ diagram after multiple attempts');
    }
  }

  /**
   * Determine if an error is more informative than another
   *
   * @param newError The new error to evaluate
   * @param currentBestError The current most informative error
   * @returns True if the new error is more informative
   */
  private isMoreInformativeError(newError: any, currentBestError: any): boolean {
    if (!currentBestError) return true;

    // Errors with errorInfo are generally more informative
    if (newError.errorInfo && !currentBestError.errorInfo) return true;

    // Errors with specific error types are more informative
    if (newError.errorInfo?.errorType && !currentBestError.errorInfo?.errorType) return true;

    // Errors with suggestions are more informative
    if (newError.errorInfo?.suggestion && !currentBestError.errorInfo?.suggestion) return true;

    // Errors with context are more informative
    if (newError.errorInfo?.context && !currentBestError.errorInfo?.context) return true;

    // Errors with line numbers are more informative
    if (newError.errorInfo?.line && !currentBestError.errorInfo?.line) return true;

    // Specific error types are more informative than generic ones
    const specificErrorTypes = [
      'UndefinedControlSequence',
      'MissingPackage',
      'MathModeError',
      'MissingBeginDocument',
      'NoLineToEnd'
    ];

    if (newError.errorInfo?.errorType &&
        specificErrorTypes.includes(newError.errorInfo.errorType) &&
        (!currentBestError.errorInfo?.errorType ||
         !specificErrorTypes.includes(currentBestError.errorInfo.errorType))) {
      return true;
    }

    // Prefer the first error by default (Strategy 1 errors are often most relevant)
    return false;
  }

  /**
   * Get a suggestion for a specific error type
   *
   * @param errorInfo The error information
   * @param code The original TikZ code
   * @returns A suggestion string
   */
  private getSuggestionForError(errorInfo: any, code: string): string {
    const errorType = errorInfo.errorType || '';

    switch (errorType) {
      case 'UndefinedControlSequence':
        if (code.includes('\\celsius') || code.includes('\\textcelsius')) {
          return 'The \\celsius or \\textcelsius command requires the siunitx package. Try adding "\\usepackage{siunitx}" to your preamble, or use $^{\\circ}$C instead.';
        }
        if (code.includes('\\begin{axis}') || code.includes('\\addplot')) {
          return 'You are using PGFPlots commands. Make sure to add "\\usepackage{pgfplots}\\pgfplotsset{compat=1.18}" to your preamble.';
        }
        return errorInfo.suggestion || 'Check for typos or make sure you\'ve loaded the required package for this command.';

      case 'MissingBeginDocument':
        return 'Your code might contain text outside of proper LaTeX environments. Make sure all your content is inside the tikzpicture environment.';

      case 'MissingPackage':
        return `The package ${errorInfo.code} is not installed or not found. Add it to your LaTeX distribution or check for typos in the package name.`;

      case 'MathModeError':
        return 'You\'re using math commands outside of math mode. Enclose them in $...$ or use \\(...\\) for inline math.';

      case 'NoLineToEnd':
        return 'You might have an empty line or a command that expects text but found none. Check your TikZ syntax and remove blank lines inside environments.';

      case 'DimensionTooLarge':
        return 'You\'ve specified a dimension that\'s too large for TeX to handle. Check your coordinate values or scaling factors.';

      default:
        return errorInfo.suggestion || 'Check your TikZ code for syntax errors.';
    }
  }
}
