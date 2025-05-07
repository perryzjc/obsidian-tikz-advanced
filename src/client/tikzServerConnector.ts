import { requestUrl, Notice } from 'obsidian';
import TikZAdvancedPlugin from '../main';
import {
  TikZRenderResult,
  TikZRenderRequest,
  TikZErrorResponse,
  LaTeXErrorInfo,
  HealthResponse
} from '../shared/types';

export class TikZServerConnector {
  private plugin: TikZAdvancedPlugin;

  constructor(plugin: TikZAdvancedPlugin) {
    this.plugin = plugin;
  }

  /**
   * Test the connection to the TikZ server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await requestUrl({
        url: `${this.plugin.settings.serverUrl}/health`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.status === 200;
    } catch (error) {
      console.error('Error testing TikZ server connection:', error);
      return false;
    }
  }

  /**
   * Get information about the TikZ server
   */
  async getServerInfo(): Promise<HealthResponse> {
    try {
      const response = await requestUrl({
        url: `${this.plugin.settings.serverUrl}/health`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }

      return response.json as HealthResponse;
    } catch (error) {
      console.error('Error getting TikZ server info:', error);
      throw error;
    }
  }

  /**
   * Render a TikZ diagram
   */
  async renderTikZ(
    source: string,
    format: 'svg' | 'pdf',
    engine: 'pdflatex' | 'lualatex' | 'xelatex'
  ): Promise<TikZRenderResult> {
    if (this.plugin.settings.debugMode) {
      console.log('Rendering TikZ:', { source, format, engine });
    }

    try {
      // Process the source code to ensure it's in the correct format
      const processedSource = this.preprocessTikZCode(source);

      // Only send the custom preamble if it's not empty
      const preamble = this.plugin.settings.customPreamble.trim()
        ? this.plugin.settings.customPreamble
        : undefined;

      const request: TikZRenderRequest = {
        tikzCode: processedSource,
        format,
        engine,
        preamble,
        source: 'obsidian-plugin'
      };

      const response = await requestUrl({
        url: `${this.plugin.settings.serverUrl}/render`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      // Always expect a 200 response with potential error information in the body
      const result = response.json;

      // Check if the response contains an error
      if (result.error || result.success === false) {
        console.log('Server returned error in response body:', result);

        // Create a custom error with the structured error information
        const error: any = new Error(result.error || 'Unknown error');

        // Add the error info if available
        if (result.errorInfo) {
          error.errorInfo = result.errorInfo;
          console.log('Error info from response:', result.errorInfo);
        }

        // Add the HTML error if available
        if (result.errorHTML) {
          error.errorHTML = result.errorHTML;
          console.log('Error HTML from response:', result.errorHTML ? '[HTML content available]' : undefined);
        }

        // Add any other error properties
        if (result.errorType) {
          error.errorType = result.errorType;
        }

        if (result.severity) {
          error.severity = result.severity;
        }

        throw error;
      }

      // If we get here, the response should be a successful render result

      return {
        content: result.content,
        format: format,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Error rendering TikZ:', error);
      throw error;
    }
  }

  /**
   * Preprocess TikZ code to ensure it's in the correct format for the server
   *
   * @param source The TikZ code to preprocess
   * @returns The preprocessed TikZ code
   */
  private preprocessTikZCode(source: string): string {
    // Remove document class and document environment if present
    let processedSource = source;

    // Remove document class
    processedSource = processedSource.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/g, '');

    // Remove begin/end document
    processedSource = processedSource.replace(/\\begin\s*\{\s*document\s*\}/g, '');
    processedSource = processedSource.replace(/\\end\s*\{\s*document\s*\}/g, '');

    // Remove usepackage commands
    processedSource = processedSource.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, '');

    // Remove pgfplotsset commands
    processedSource = processedSource.replace(/\\pgfplotsset\s*\{[^}]*\}/g, '');

    // KEEP usetikzlibrary commands - the server will extract and process them
    // This allows users to specify libraries directly in their TikZ code
    // processedSource = processedSource.replace(/\\usetikzlibrary\s*\{[^}]*\}/g, '');

    // Trim whitespace
    processedSource = processedSource.trim();

    // If the code doesn't have a tikzpicture environment, the server will add it

    return processedSource;
  }
}
