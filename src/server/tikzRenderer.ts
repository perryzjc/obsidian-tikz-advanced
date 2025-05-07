import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { TikZRenderResult } from '../shared/types';
import { Logger } from '../shared/logger';
import { LaTeXEngineManager, LaTeXEngine } from './latexEngineManager';
import { LaTeXErrorParser } from './latexErrorParser';
import { TikZPreprocessor } from './tikzPreprocessor';
import { ProgressiveRenderer } from './progressiveRenderer';
import { SVGOptimizer } from './svgOptimizer';

export class TikZRenderer {
  private tempDir: string;
  private logger: Logger;
  private engineManager: LaTeXEngineManager;
  private svgOptimizer: SVGOptimizer;
  public tikzPreprocessor: TikZPreprocessor;
  private progressiveRenderer: ProgressiveRenderer;
  private useProgressiveRendering: boolean = true;
  private maxRenderingAttempts: number = 4;

  constructor(config?: { enableProgressiveRendering?: boolean; maxRenderingAttempts?: number }) {
    this.logger = new Logger('TikZRenderer');
    this.engineManager = new LaTeXEngineManager();
    this.svgOptimizer = new SVGOptimizer();
    this.tikzPreprocessor = new TikZPreprocessor();

    // Set progressive rendering based on config
    if (config) {
      if (config.enableProgressiveRendering !== undefined) {
        this.useProgressiveRendering = config.enableProgressiveRendering;
      }

      if (config.maxRenderingAttempts !== undefined && config.maxRenderingAttempts > 0) {
        this.maxRenderingAttempts = config.maxRenderingAttempts;
      }
    }

    this.progressiveRenderer = new ProgressiveRenderer(this, this.maxRenderingAttempts);

    // Create a temporary directory for rendering
    this.tempDir = path.join(os.tmpdir(), 'tikz-renderer');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.logger.info(`Temporary directory: ${this.tempDir}`);
  }

  /**
   * Render a TikZ diagram
   *
   * If progressive rendering is enabled, this will try multiple strategies
   * to render the diagram, improving the success rate.
   */
  async render(
    tikzCode: string,
    format: 'svg' | 'pdf' = 'svg',
    engine: LaTeXEngine = 'pdflatex',
    preamble: string = '\\usepackage{tikz}\n\\usepackage{pgfplots}\n\\pgfplotsset{compat=1.18}'
  ): Promise<TikZRenderResult> {
    // Use progressive rendering if enabled
    if (this.useProgressiveRendering) {
      return this.progressiveRenderer.render(tikzCode, format, engine, preamble);
    }

    // Otherwise, use the direct rendering approach
    return this.renderDirect(tikzCode, format, engine, preamble);
  }

  /**
   * Direct rendering method that bypasses progressive rendering
   * This is used by the ProgressiveRenderer to avoid infinite recursion
   */
  async renderDirect(
    tikzCode: string,
    format: 'svg' | 'pdf' = 'svg',
    engine: LaTeXEngine = 'pdflatex',
    preamble: string = '\\usepackage{tikz}\n\\usepackage{pgfplots}\n\\pgfplotsset{compat=1.18}'
  ): Promise<TikZRenderResult> {
    // Initialize the engine manager if not already initialized
    await this.engineManager.initialize();

    // Get the best available engine
    const bestEngine = this.engineManager.getBestEngine(engine);
    if (bestEngine !== engine) {
      this.logger.warn(`Requested engine ${engine} not available, using ${bestEngine} instead`);
    }

    // Create a unique ID for this rendering job
    const jobId = crypto.createHash('md5').update(tikzCode + format + bestEngine + preamble).digest('hex');
    const workDir = path.join(this.tempDir, jobId);

    this.logger.debug(`Rendering job ${jobId} with engine ${bestEngine}, format ${format}`);

    // Create the working directory
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    // Create the LaTeX document
    const texFilePath = path.join(workDir, 'tikz.tex');
    const texContent = this.createTexDocument(tikzCode, preamble);

    // Log the preamble for debugging
    this.logger.debug(`Using preamble:\n${preamble}`);
    console.log(`Using preamble for TikZ rendering:\n${preamble}`);

    fs.writeFileSync(texFilePath, texContent);
    this.logger.debug(`Created TeX file: ${texFilePath}`);

    try {
      // Compile the LaTeX document to PDF
      const pdfFilePath = path.join(workDir, 'tikz.pdf');
      const compilationResult = await this.engineManager.compile(bestEngine, texFilePath, workDir);

      if (!compilationResult.success) {
        // Parse the error
        const errorInfo = LaTeXErrorParser.extractError(compilationResult.output);
        const formattedError = LaTeXErrorParser.formatError(errorInfo);
        const errorHTML = LaTeXErrorParser.formatErrorHTML(errorInfo);

        // Create a custom error with the structured error information
        const error: any = new Error(formattedError);
        error.errorInfo = errorInfo;
        error.errorHTML = errorHTML;
        throw error;
      }

      this.logger.debug(`Compilation successful, PDF created at: ${pdfFilePath}`);

      // Convert to the requested format
      if (format === 'svg') {
        const svgFilePath = path.join(workDir, 'tikz.svg');
        await this.convertPdfToSvg(pdfFilePath, svgFilePath);

        // Optimize the SVG
        const svgContent = await this.svgOptimizer.optimize(svgFilePath);

        // Extract width and height from SVG
        const dimensions = this.svgOptimizer.extractDimensions(svgContent);

        this.logger.debug(`SVG created with dimensions: ${dimensions.width}x${dimensions.height}`);

        return {
          content: svgContent,
          format: 'svg',
          width: dimensions.width,
          height: dimensions.height
        };
      } else {
        // Read the PDF file as base64
        const pdfContent = fs.readFileSync(pdfFilePath).toString('base64');

        this.logger.debug(`PDF created and encoded as base64`);

        return {
          content: pdfContent,
          format: 'pdf'
        };
      }
    } catch (error: any) {
      this.logger.error(`Error rendering TikZ: ${error.message || 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Create a LaTeX document with the TikZ code
   */
  private createTexDocument(tikzCode: string, preamble: string): string {
    // Use the tikzPreprocessor to handle various input styles
    const { processedCode, enhancedPreamble, documentStructureAdded, fixedSyntaxIssues } = this.tikzPreprocessor.preprocess(tikzCode, preamble);

    // Log if syntax issues were fixed
    if (fixedSyntaxIssues) {
      this.logger.info('Fixed common syntax issues in TikZ code');
    }

    // If the preprocessor already added document structure, use the processed code directly
    if (documentStructureAdded) {
      this.logger.debug('Using preprocessed code with document structure');
      return `\\documentclass[tikz]{standalone}
${enhancedPreamble}

${processedCode}`;
    }

    // Otherwise, create a standard document
    this.logger.debug('Creating standard TeX document with processed code');
    return `\\documentclass[tikz]{standalone}
${enhancedPreamble}

\\begin{document}
${processedCode}
\\end{document}`;
  }

  /**
   * Compile a TeX file to PDF
   */
  private async compileTex(
    texFilePath: string,
    workDir: string,
    engine: 'pdflatex' | 'lualatex' | 'xelatex'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Run the LaTeX engine with appropriate options
      const command = `${engine} -interaction=nonstopmode -halt-on-error -output-directory="${workDir}" "${texFilePath}"`;

      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          // Extract the error message from the LaTeX output using LaTeXErrorParser
          const errorInfo = LaTeXErrorParser.extractError(stdout);
          const formattedError = LaTeXErrorParser.formatError(errorInfo);
          reject(new Error(formattedError || error.message || 'Unknown LaTeX error'));
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Convert a PDF file to SVG
   */
  private async convertPdfToSvg(pdfFilePath: string, svgFilePath: string): Promise<void> {
    this.logger.debug(`Converting PDF to SVG: ${pdfFilePath} -> ${svgFilePath}`);

    // Try pdf2svg first
    try {
      await this.tryConversionMethod('pdf2svg', `pdf2svg "${pdfFilePath}" "${svgFilePath}"`);
      this.logger.debug('PDF converted to SVG using pdf2svg');
      return;
    } catch (error: any) {
      this.logger.warn(`pdf2svg conversion failed: ${error.message || 'Unknown error'}, trying alternatives`);
    }

    // Try Inkscape
    try {
      await this.tryConversionMethod('Inkscape', `inkscape --export-type=svg --export-filename="${svgFilePath}" "${pdfFilePath}"`);
      this.logger.debug('PDF converted to SVG using Inkscape');
      return;
    } catch (error: any) {
      this.logger.warn(`Inkscape conversion failed: ${error.message || 'Unknown error'}, trying alternatives`);
    }

    // Try pdftocairo
    try {
      await this.tryConversionMethod('pdftocairo', `pdftocairo -svg "${pdfFilePath}" "${svgFilePath}"`);
      this.logger.debug('PDF converted to SVG using pdftocairo');
      return;
    } catch (error: any) {
      this.logger.warn(`pdftocairo conversion failed: ${error.message || 'Unknown error'}`);
    }

    // If all methods fail, throw an error
    throw new Error('Failed to convert PDF to SVG. Please install pdf2svg, Inkscape, or pdftocairo.');
  }

  /**
   * Try a conversion method
   */
  private async tryConversionMethod(name: string, command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.debug(`Trying ${name} conversion: ${command}`);

      const childProcess = require('child_process');
      childProcess.exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          reject(new Error(`${name} conversion failed: ${error.message || 'Unknown error'}`));
          return;
        }

        resolve();
      });
    });
  }
}
