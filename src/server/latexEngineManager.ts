import { exec } from 'child_process';
import { Logger } from '../shared/logger';
import { checkDependencies } from './dependencyChecker';

export type LaTeXEngine = 'pdflatex' | 'lualatex' | 'xelatex';

interface EngineConfig {
  command: string;
  args: string[];
  available: boolean;
}

/**
 * Manager for LaTeX engines
 */
export class LaTeXEngineManager {
  private engines: Map<LaTeXEngine, EngineConfig>;
  private logger: Logger;
  private initialized: boolean = false;

  constructor() {
    this.logger = new Logger('LaTeXEngineManager');
    this.engines = new Map();

    // Default engine configurations
    this.engines.set('pdflatex', {
      command: 'pdflatex',
      args: ['-interaction=nonstopmode', '-halt-on-error'],
      available: false
    });

    this.engines.set('lualatex', {
      command: 'lualatex',
      args: ['-interaction=nonstopmode', '-halt-on-error'],
      available: false
    });

    this.engines.set('xelatex', {
      command: 'xelatex',
      args: ['-interaction=nonstopmode', '-halt-on-error'],
      available: false
    });
  }

  /**
   * Initialize the engine manager by checking which engines are available
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const dependencies = await checkDependencies();

    this.engines.get('pdflatex')!.available = dependencies.pdflatex;
    this.engines.get('lualatex')!.available = dependencies.lualatex;
    this.engines.get('xelatex')!.available = dependencies.xelatex;

    this.logger.info('LaTeX engines available:', {
      pdflatex: this.engines.get('pdflatex')!.available,
      lualatex: this.engines.get('lualatex')!.available,
      xelatex: this.engines.get('xelatex')!.available
    });

    this.initialized = true;
  }

  /**
   * Get the best available engine
   * If the requested engine is not available, fall back to another one
   */
  getBestEngine(requested: LaTeXEngine): LaTeXEngine {
    if (!this.initialized) {
      this.logger.warn('Engine manager not initialized, using default engine');
      return 'pdflatex';
    }

    // If the requested engine is available, use it
    if (this.engines.get(requested)?.available) {
      return requested;
    }

    // Otherwise, fall back to another available engine
    this.logger.warn(`Requested engine ${requested} not available, falling back`);

    if (this.engines.get('pdflatex')?.available) return 'pdflatex';
    if (this.engines.get('lualatex')?.available) return 'lualatex';
    if (this.engines.get('xelatex')?.available) return 'xelatex';

    // If no engines are available, return the requested one anyway
    // (it will fail later, but at least we're consistent)
    this.logger.error('No LaTeX engines available');
    return requested;
  }

  /**
   * Check if an engine is available
   */
  isEngineAvailable(engine: LaTeXEngine): boolean {
    if (!this.initialized) {
      this.logger.warn('Engine manager not initialized');
      return false;
    }

    return this.engines.get(engine)?.available || false;
  }

  /**
   * Get the command and arguments for an engine
   */
  getEngineCommand(engine: LaTeXEngine): { command: string; args: string[] } {
    const engineConfig = this.engines.get(engine);

    if (!engineConfig) {
      throw new Error(`Unknown LaTeX engine: ${engine}`);
    }

    return {
      command: engineConfig.command,
      args: [...engineConfig.args]
    };
  }

  /**
   * Compile a TeX file using the specified engine
   */
  async compile(
    engine: LaTeXEngine,
    texFilePath: string,
    outputDir: string,
    timeout = 30000
  ): Promise<{ success: boolean; output: string }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const bestEngine = this.getBestEngine(engine);
    const { command, args } = this.getEngineCommand(bestEngine);

    // Add output directory and file path to arguments
    const fullArgs = [...args, `-output-directory=${outputDir}`, texFilePath];

    this.logger.debug(`Compiling with ${bestEngine}: ${command} ${fullArgs.join(' ')}`);

    return new Promise((resolve) => {
      // Set a timeout
      const timeoutId = setTimeout(() => {
        this.logger.error(`Compilation timed out after ${timeout}ms`);
        resolve({
          success: false,
          output: 'Compilation timed out'
        });
      }, timeout);

      // Execute the command
      exec(`${command} ${fullArgs.join(' ')}`, (error: any, stdout: string, stderr: string) => {
        clearTimeout(timeoutId);

        if (error) {
          this.logger.error(`Compilation failed: ${error.message || 'Unknown error'}`);
          resolve({
            success: false,
            output: stdout + stderr
          });
          return;
        }

        this.logger.debug('Compilation successful');
        resolve({
          success: true,
          output: stdout + stderr
        });
      });
    });
  }
}
