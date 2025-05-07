/**
 * TikZ Example Tester
 * 
 * This script tests TikZ examples by sending them to the TikZ rendering server
 * and checking if they render successfully.
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { TikZRenderRequest } from '../shared/types';

// Configuration
const SERVER_URL = 'http://localhost:3000/render'; // Default server URL
const EXAMPLES_DIR = path.join(__dirname, '../../examples');
const OUTPUT_DIR = path.join(__dirname, '../../test-results');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract TikZ code from a markdown file
 * @param filePath Path to the markdown file
 * @returns Array of TikZ code blocks
 */
function extractTikZFromMarkdown(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const tikzBlocks: string[] = [];
  
  // Match code blocks with tikz language identifier
  const regex = /```tikz\n([\s\S]*?)\n```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    tikzBlocks.push(match[1]);
  }
  
  return tikzBlocks;
}

/**
 * Send TikZ code to the server for rendering
 * @param tikzCode The TikZ code to render
 * @param serverUrl The server URL
 * @returns Promise resolving to the server response
 */
async function renderTikZ(tikzCode: string, serverUrl: string = SERVER_URL): Promise<any> {
  const request: TikZRenderRequest = {
    tikzCode,
    format: 'svg',
    engine: 'pdflatex',
    source: 'test'
  };
  
  try {
    const response = await axios.post(serverUrl, request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
}

/**
 * Test a single TikZ example
 * @param tikzCode The TikZ code to test
 * @param name Name for the test result
 * @returns Test result object
 */
async function testTikZExample(tikzCode: string, name: string): Promise<TestResult> {
  console.log(`Testing example: ${name}`);
  
  try {
    const result = await renderTikZ(tikzCode);
    const success = result.success === true;
    
    // Save the result for inspection
    const resultPath = path.join(OUTPUT_DIR, `${name}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    
    if (success && result.svg) {
      // Save the SVG if successful
      const svgPath = path.join(OUTPUT_DIR, `${name}.svg`);
      fs.writeFileSync(svgPath, result.svg);
    }
    
    return {
      name,
      success,
      error: success ? null : (result.error || 'Unknown error'),
      errorDetails: success ? null : (result.errorDetails || null)
    };
  } catch (error) {
    console.error(`Error testing ${name}:`, error);
    return {
      name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: null
    };
  }
}

/**
 * Test all examples in a markdown file
 * @param filePath Path to the markdown file
 * @returns Array of test results
 */
async function testMarkdownFile(filePath: string): Promise<TestResult[]> {
  const fileName = path.basename(filePath, path.extname(filePath));
  const tikzBlocks = extractTikZFromMarkdown(filePath);
  const results: TestResult[] = [];
  
  console.log(`Testing file: ${fileName} (${tikzBlocks.length} examples)`);
  
  for (let i = 0; i < tikzBlocks.length; i++) {
    const exampleName = `${fileName}_example_${i + 1}`;
    const result = await testTikZExample(tikzBlocks[i], exampleName);
    results.push(result);
  }
  
  return results;
}

/**
 * Test all markdown files in the examples directory
 * @returns Object with test results
 */
async function testAllExamples(): Promise<TestSummary> {
  const files = fs.readdirSync(EXAMPLES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(EXAMPLES_DIR, file));
  
  const allResults: TestResult[] = [];
  const fileResults: Record<string, TestResult[]> = {};
  
  for (const file of files) {
    const fileName = path.basename(file);
    const results = await testMarkdownFile(file);
    fileResults[fileName] = results;
    allResults.push(...results);
  }
  
  const summary: TestSummary = {
    totalTests: allResults.length,
    passed: allResults.filter(r => r.success).length,
    failed: allResults.filter(r => !r.success).length,
    fileResults,
    allResults
  };
  
  // Save summary
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  return summary;
}

/**
 * Generate a markdown report from test results
 * @param summary Test summary
 * @returns Markdown report
 */
function generateMarkdownReport(summary: TestSummary): string {
  let report = `# TikZ Examples Test Report\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total examples tested: ${summary.totalTests}\n`;
  report += `- Passed: ${summary.passed} (${Math.round(summary.passed / summary.totalTests * 100)}%)\n`;
  report += `- Failed: ${summary.failed} (${Math.round(summary.failed / summary.totalTests * 100)}%)\n\n`;
  
  report += `## Results by File\n\n`;
  
  for (const [fileName, results] of Object.entries(summary.fileResults)) {
    const filePassed = results.filter(r => r.success).length;
    const fileFailed = results.filter(r => !r.success).length;
    
    report += `### ${fileName}\n\n`;
    report += `- Examples: ${results.length}\n`;
    report += `- Passed: ${filePassed}\n`;
    report += `- Failed: ${fileFailed}\n\n`;
    
    if (fileFailed > 0) {
      report += `#### Failed Examples\n\n`;
      
      for (const result of results.filter(r => !r.success)) {
        report += `- **${result.name}**: ${result.error}\n`;
        if (result.errorDetails) {
          report += `  \`\`\`\n  ${result.errorDetails}\n  \`\`\`\n`;
        }
      }
      
      report += `\n`;
    }
  }
  
  return report;
}

// Types
interface TestResult {
  name: string;
  success: boolean;
  error: string | null;
  errorDetails: string | null;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  fileResults: Record<string, TestResult[]>;
  allResults: TestResult[];
}

// Main function
async function main() {
  console.log('Starting TikZ example tests...');
  
  try {
    const summary = await testAllExamples();
    
    console.log('\nTest Summary:');
    console.log(`Total: ${summary.totalTests}, Passed: ${summary.passed}, Failed: ${summary.failed}`);
    
    // Generate and save report
    const report = generateMarkdownReport(summary);
    const reportPath = path.join(OUTPUT_DIR, 'report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\nTest report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

// Export functions for use in other scripts
export {
  extractTikZFromMarkdown,
  renderTikZ,
  testTikZExample,
  testMarkdownFile,
  testAllExamples
};
