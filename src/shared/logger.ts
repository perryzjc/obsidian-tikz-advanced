/**
 * Logger utility for consistent logging across client and server
 */
export class Logger {
  private prefix: string;
  private debugMode: boolean;

  constructor(prefix: string, debugMode = false) {
    this.prefix = prefix;
    this.debugMode = debugMode;
  }

  /**
   * Set debug mode
   */
  setDebugMode(debugMode: boolean): void {
    this.debugMode = debugMode;
  }

  /**
   * Log an informational message
   */
  info(message: string, ...args: any[]): void {
    console.log(`[${this.prefix}] INFO: ${message}`, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.prefix}] WARNING: ${message}`, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    console.error(`[${this.prefix}] ERROR: ${message}`, ...args);
  }

  /**
   * Log a debug message (only in debug mode)
   */
  debug(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.debug(`[${this.prefix}] DEBUG: ${message}`, ...args);
    }
  }
}
