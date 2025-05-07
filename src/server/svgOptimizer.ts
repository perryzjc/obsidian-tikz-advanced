import { exec } from 'child_process';
import * as fs from 'fs';
import { Logger } from '../shared/logger';

/**
 * Utility for optimizing SVG files
 */
export class SVGOptimizer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('SVGOptimizer');
  }

  /**
   * Optimize an SVG file
   * @param svgFilePath Path to the SVG file
   * @returns Optimized SVG content
   */
  async optimize(svgFilePath: string): Promise<string> {
    try {
      // Read the SVG file
      const svgContent = fs.readFileSync(svgFilePath, 'utf8');

      // Try to use svgo if available
      const optimizedSvg = await this.tryOptimizeWithSvgo(svgFilePath);
      if (optimizedSvg) {
        return optimizedSvg;
      }

      // Otherwise, do basic optimization
      return this.basicOptimize(svgContent);
    } catch (error: any) {
      this.logger.error(`Error optimizing SVG: ${error.message || 'Unknown error'}`);
      // Return the original file content
      return fs.readFileSync(svgFilePath, 'utf8');
    }
  }

  /**
   * Try to optimize SVG using svgo if available
   */
  private async tryOptimizeWithSvgo(svgFilePath: string): Promise<string | null> {
    return new Promise((resolve) => {
      exec(`svgo --input=${svgFilePath} --output=- --pretty`, (error: any, stdout: string) => {
        if (error) {
          this.logger.debug('svgo not available, falling back to basic optimization');
          resolve(null);
          return;
        }

        this.logger.debug('SVG optimized with svgo');
        resolve(stdout);
      });
    });
  }

  /**
   * Basic SVG optimization
   */
  private basicOptimize(svgContent: string): string {
    // Remove XML declaration
    let optimized = svgContent.replace(/<\?xml[^>]*\?>/, '');

    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

    // Remove empty groups
    optimized = optimized.replace(/<g[^>]*>\s*<\/g>/g, '');

    // Remove unnecessary whitespace
    optimized = optimized.replace(/>\s+</g, '><');

    // Add viewBox if missing but width/height are present
    if (!optimized.includes('viewBox') && optimized.match(/width="([^"]+)"/) && optimized.match(/height="([^"]+)"/)) {
      const width = optimized.match(/width="([^"]+)"/)?.[1];
      const height = optimized.match(/height="([^"]+)"/)?.[1];

      if (width && height) {
        optimized = optimized.replace(/<svg/, `<svg viewBox="0 0 ${width} ${height}"`);
      }
    }

    return optimized;
  }

  /**
   * Extract dimensions from SVG content
   */
  extractDimensions(svgContent: string): { width: number; height: number } {
    // Try to get dimensions from viewBox
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const [, , , width, height] = viewBoxMatch[1].split(/\s+/).map(parseFloat);
      if (!isNaN(width) && !isNaN(height)) {
        return { width, height };
      }
    }

    // Try to get dimensions from width/height attributes
    const widthMatch = svgContent.match(/width="([^"]+)"/);
    const heightMatch = svgContent.match(/height="([^"]+)"/);

    let width = 0;
    let height = 0;

    if (widthMatch && widthMatch[1]) {
      width = parseFloat(widthMatch[1]);
    }

    if (heightMatch && heightMatch[1]) {
      height = parseFloat(heightMatch[1]);
    }

    return { width, height };
  }
}
