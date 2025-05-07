/**
 * TikZ Example Fixer
 * 
 * This script analyzes failed TikZ examples and attempts to fix common issues.
 */

import fs from 'fs';
import path from 'path';
import { extractTikZFromMarkdown, renderTikZ, testTikZExample } from './tikz-example-tester';

// Configuration
const EXAMPLES_DIR = path.join(__dirname, '../../examples');
const FIXED_DIR = path.join(__dirname, '../../fixed-examples');

// Ensure fixed directory exists
if (!fs.existsSync(FIXED_DIR)) {
  fs.mkdirSync(FIXED_DIR, { recursive: true });
}

/**
 * Apply common fixes to TikZ code
 * @param tikzCode The original TikZ code
 * @returns Fixed TikZ code
 */
function applyCommonFixes(tikzCode: string): string {
  let fixed = tikzCode;
  
  // Fix 1: Add document class and tikz package if not present
  if (!fixed.includes('\\documentclass') && !fixed.includes('\\usepackage{tikz}')) {
    fixed = `\\documentclass{standalone}\n\\usepackage{tikz}\n\\begin{document}\n${fixed}\n\\end{document}`;
  }
  
  // Fix 2: Add missing semicolons after commands
  fixed = fixed.replace(/\\draw([^;]*?)(?=\\|\n|$)/g, '\\draw$1;');
  fixed = fixed.replace(/\\node([^;]*?)(?=\\|\n|$)/g, '\\node$1;');
  fixed = fixed.replace(/\\path([^;]*?)(?=\\|\n|$)/g, '\\path$1;');
  
  // Fix 3: Add braces around foreach loop bodies
  fixed = fixed.replace(/(\\foreach\s+[^\{]+\s+in\s+\{[^\}]+\})([^{])/g, '$1 {$2');
  
  // Fix 4: Fix common PGFPlots issues
  if (fixed.includes('\\begin{axis}')) {
    // Add pgfplots package if not present
    if (!fixed.includes('\\usepackage{pgfplots}')) {
      fixed = fixed.replace('\\usepackage{tikz}', '\\usepackage{tikz}\n\\usepackage{pgfplots}');
    }
    
    // Add compat level if not present
    if (!fixed.includes('\\pgfplotsset{compat')) {
      fixed = fixed.replace('\\usepackage{pgfplots}', '\\usepackage{pgfplots}\n\\pgfplotsset{compat=1.18}');
    }
  }
  
  // Fix 5: Fix 3D plots
  if (fixed.includes('\\addplot3')) {
    if (!fixed.includes('\\usepackage{pgfplots}')) {
      fixed = fixed.replace('\\usepackage{tikz}', '\\usepackage{tikz}\n\\usepackage{pgfplots}');
    }
  }
  
  return fixed;
}

/**
 * Try multiple fix strategies on a TikZ example
 * @param tikzCode The original TikZ code
 * @returns Object with the best fixed version and test result
 */
async function tryFixStrategies(tikzCode: string, name: string): Promise<FixResult> {
  console.log(`Attempting to fix example: ${name}`);
  
  // Strategy 1: Apply common fixes
  const commonFixed = applyCommonFixes(tikzCode);
  const commonResult = await testTikZExample(commonFixed, `${name}_common_fixed`);
  
  // Strategy 2: Wrap in minimal document
  const minimalDoc = `\\documentclass{standalone}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\begin{document}
${tikzCode}
\\end{document}`;
  const minimalResult = await testTikZExample(minimalDoc, `${name}_minimal_doc`);
  
  // Strategy 3: Add specific libraries based on content
  let librariesCode = tikzCode;
  const libraries = [];
  
  if (tikzCode.includes('circle') || tikzCode.includes('rectangle') || tikzCode.includes('ellipse')) {
    libraries.push('shapes.geometric');
  }
  
  if (tikzCode.includes('->') || tikzCode.includes('stealth')) {
    libraries.push('arrows.meta');
  }
  
  if (tikzCode.includes('above') || tikzCode.includes('below') || tikzCode.includes('right of') || tikzCode.includes('left of')) {
    libraries.push('positioning');
  }
  
  if (tikzCode.includes('cylinder')) {
    libraries.push('shapes.misc');
  }
  
  if (libraries.length > 0) {
    const librariesStr = libraries.map(lib => `\\usetikzlibrary{${lib}}`).join('\n');
    librariesCode = `\\documentclass{standalone}
\\usepackage{tikz}
${librariesStr}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\begin{document}
${tikzCode}
\\end{document}`;
  }
  
  const librariesResult = await testTikZExample(librariesCode, `${name}_libraries`);
  
  // Choose the best result
  const results = [
    { code: commonFixed, result: commonResult },
    { code: minimalDoc, result: minimalResult },
    { code: librariesCode, result: librariesResult }
  ];
  
  const bestResult = results.find(r => r.result.success);
  
  if (bestResult) {
    return {
      originalCode: tikzCode,
      fixedCode: bestResult.code,
      success: true,
      strategy: results.indexOf(bestResult) === 0 ? 'common_fixes' : 
                results.indexOf(bestResult) === 1 ? 'minimal_doc' : 'libraries',
      result: bestResult.result
    };
  }
  
  // If all strategies failed, return the common fixes version
  return {
    originalCode: tikzCode,
    fixedCode: commonFixed,
    success: false,
    strategy: 'common_fixes',
    result: commonResult
  };
}

/**
 * Fix examples in a markdown file
 * @param filePath Path to the markdown file
 * @returns Fixed markdown content
 */
async function fixMarkdownFile(filePath: string): Promise<string> {
  const fileName = path.basename(filePath, path.extname(filePath));
  const content = fs.readFileSync(filePath, 'utf-8');
  const tikzBlocks = extractTikZFromMarkdown(filePath);
  let fixedContent = content;
  
  console.log(`Fixing file: ${fileName} (${tikzBlocks.length} examples)`);
  
  for (let i = 0; i < tikzBlocks.length; i++) {
    const exampleName = `${fileName}_example_${i + 1}`;
    const fixResult = await tryFixStrategies(tikzBlocks[i], exampleName);
    
    if (fixResult.success) {
      console.log(`✅ Successfully fixed example ${i + 1} using strategy: ${fixResult.strategy}`);
      
      // Replace the original code with the fixed code in the markdown
      const originalBlock = '```tikz\n' + tikzBlocks[i] + '\n```';
      const fixedBlock = '```tikz\n' + fixResult.fixedCode + '\n```';
      fixedContent = fixedContent.replace(originalBlock, fixedBlock);
    } else {
      console.log(`❌ Failed to fix example ${i + 1}`);
    }
  }
  
  return fixedContent;
}

/**
 * Fix all markdown files in the examples directory
 */
async function fixAllExamples(): Promise<void> {
  const files = fs.readdirSync(EXAMPLES_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(EXAMPLES_DIR, file));
  
  for (const file of files) {
    const fileName = path.basename(file);
    const fixedContent = await fixMarkdownFile(file);
    
    // Save the fixed file
    const fixedPath = path.join(FIXED_DIR, fileName);
    fs.writeFileSync(fixedPath, fixedContent);
    
    console.log(`Fixed file saved to: ${fixedPath}`);
  }
}

// Types
interface FixResult {
  originalCode: string;
  fixedCode: string;
  success: boolean;
  strategy: string;
  result: any;
}

// Main function
async function main() {
  console.log('Starting TikZ example fixer...');
  
  try {
    await fixAllExamples();
    console.log('\nAll examples processed. Check the fixed-examples directory for results.');
  } catch (error) {
    console.error('Error fixing examples:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

// Export functions for use in other scripts
export {
  applyCommonFixes,
  tryFixStrategies,
  fixMarkdownFile,
  fixAllExamples
};
