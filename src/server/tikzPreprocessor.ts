import { Logger } from '../shared/logger';

/**
 * TikZ Preprocessor
 *
 * This class provides smart preprocessing for TikZ code to improve compatibility
 * and handle various user input styles.
 */
export class TikZPreprocessor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('TikZPreprocessor');
  }

  /**
   * Preprocess TikZ code to improve compatibility
   *
   * @param code The TikZ code to preprocess
   * @param userPreamble The user-provided preamble
   * @returns The preprocessed code and enhanced preamble
   */
  preprocess(code: string, userPreamble: string): {
    processedCode: string;
    enhancedPreamble: string;
    documentStructureAdded: boolean;
    fixedSyntaxIssues: boolean;
  } {
    this.logger.debug('Preprocessing TikZ code');

    // First, fix common syntax issues
    const { fixedCode, fixedIssues } = this.fixCommonSyntaxIssues(code);
    let processedCode = fixedCode;

    // Extract library declarations from the user code
    const { extractedCode, extractedLibraries } = this.extractLibraryDeclarations(processedCode);
    processedCode = extractedCode;

    // Log extracted libraries
    if (extractedLibraries.length > 0) {
      this.logger.info(`Extracted library declarations from user code: ${extractedLibraries.join(', ')}`);
      console.log(`TikZ libraries found in user code: ${extractedLibraries.join(', ')}`);
    }

    // Detect document structure
    const hasDocumentClass = /\\documentclass/.test(processedCode);
    const hasBeginDocument = /\\begin\s*{\s*document\s*}/.test(processedCode);
    const hasEndDocument = /\\end\s*{\s*document\s*}/.test(processedCode);

    // Detect TikZ-specific elements
    const hasTikzPicture = /\\begin\s*{\s*tikzpicture\s*}/.test(processedCode);
    const hasEndTikzPicture = /\\end\s*{\s*tikzpicture\s*}/.test(processedCode);
    const hasUsetikzlibrary = /\\usetikzlibrary/.test(processedCode);
    const hasAxis = /\\begin\s*{\s*axis\s*}/.test(processedCode);
    const hasEndAxis = /\\end\s*{\s*axis\s*}/.test(processedCode);

    // Check if the code already has a complete document structure
    const hasCompleteDocument = hasDocumentClass && hasBeginDocument && hasEndDocument;

    // Check if the code has a complete tikzpicture environment
    const hasCompleteTikzPicture = hasTikzPicture && hasEndTikzPicture;

    // Check if the code has a complete axis environment
    const hasCompleteAxis = hasAxis && hasEndAxis;

    // Build enhanced preamble, including extracted libraries
    const enhancedPreamble = this.buildEnhancedPreamble(userPreamble, processedCode, extractedLibraries);

    // Process the code based on its structure
    let documentStructureAdded = false;

    if (hasCompleteDocument) {
      // If it's a complete document, use it as is
      this.logger.debug('Using complete document as is');
      return {
        processedCode,
        enhancedPreamble: userPreamble, // Use original preamble for complete documents
        documentStructureAdded: false,
        fixedSyntaxIssues: fixedIssues
      };
    } else if (hasBeginDocument && !hasEndDocument) {
      // If it has begin{document} but no end{document}, add the end
      this.logger.debug('Adding missing end{document}');
      processedCode = `${processedCode}\n\\end{document}`;
      documentStructureAdded = true;
    } else if (hasCompleteTikzPicture && !hasBeginDocument) {
      // If it has a complete tikzpicture but no document structure, add minimal structure
      this.logger.debug('Adding document structure around complete tikzpicture');
      processedCode = `\\begin{document}\n${processedCode}\n\\end{document}`;
      documentStructureAdded = true;
    } else if (hasTikzPicture && !hasEndTikzPicture) {
      // If it has begin{tikzpicture} but no end{tikzpicture}, add the end and document structure
      this.logger.debug('Adding missing end{tikzpicture} and document structure');
      processedCode = `\\begin{document}\n${processedCode}\n\\end{tikzpicture}\n\\end{document}`;
      documentStructureAdded = true;
    } else if (hasAxis && !hasEndAxis) {
      // If it has begin{axis} but no end{axis}, add the end and necessary structure
      this.logger.debug('Adding missing end{axis} and necessary structure');
      if (!hasTikzPicture) {
        processedCode = `\\begin{document}\n\\begin{tikzpicture}\n${processedCode}\n\\end{axis}\n\\end{tikzpicture}\n\\end{document}`;
      } else {
        processedCode = `\\begin{document}\n${processedCode}\n\\end{axis}\n\\end{tikzpicture}\n\\end{document}`;
      }
      documentStructureAdded = true;
    } else if (!hasTikzPicture) {
      // If it doesn't have tikzpicture environment, add it and document structure
      this.logger.debug('Adding tikzpicture environment and document structure');
      processedCode = `\\begin{document}\n\\begin{tikzpicture}\n${processedCode}\n\\end{tikzpicture}\n\\end{document}`;
      documentStructureAdded = true;
    }

    return { processedCode, enhancedPreamble, documentStructureAdded, fixedSyntaxIssues: fixedIssues };
  }

  /**
   * Fix common syntax issues in TikZ code
   *
   * @param code The TikZ code to fix
   * @returns The fixed code and whether any issues were fixed
   */
  private fixCommonSyntaxIssues(code: string): { fixedCode: string; fixedIssues: boolean } {
    let fixedCode = code;
    let fixedIssues = false;

    // Fix 1: Add missing semicolons after \addplot commands
    const addplotRegex = /\\addplot[^;]*?(\n|$)/g;
    const fixedAddplot = fixedCode.replace(addplotRegex, (match) => {
      if (!match.trim().endsWith(';')) {
        fixedIssues = true;
        return match.trimEnd() + ';\n';
      }
      return match;
    });

    if (fixedAddplot !== fixedCode) {
      this.logger.debug('Fixed missing semicolons after \\addplot commands');
      fixedCode = fixedAddplot;
    }

    // Fix 2: Fix unclosed environments by detecting begin without matching end
    const beginAxisMatch = fixedCode.match(/\\begin\s*{\s*axis\s*}/);
    const endAxisMatch = fixedCode.match(/\\end\s*{\s*axis\s*}/);

    if (beginAxisMatch && !endAxisMatch) {
      this.logger.debug('Detected unclosed axis environment');
      fixedIssues = true;
      // Will be handled by the main preprocess method
    }

    // Fix 3: Fix missing commas in coordinate pairs
    const coordRegex = /\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/g;
    const fixedCoords = fixedCode.replace(coordRegex, (match, x, y) => {
      fixedIssues = true;
      return `(${x},${y})`;
    });

    if (fixedCoords !== fixedCode) {
      this.logger.debug('Fixed missing commas in coordinate pairs');
      fixedCode = fixedCoords;
    }

    // Fix 4: Fix pgfplots compatibility issues
    if (fixedCode.includes('\\begin{axis}') || fixedCode.includes('\\addplot')) {
      const compatRegex = /\\pgfplotsset\s*{\s*compat\s*=\s*\d+\.\d+\s*}/;
      if (!compatRegex.test(fixedCode)) {
        this.logger.debug('Adding pgfplots compat setting');
        // Will be handled by the buildEnhancedPreamble method
      }
    }

    // Fix 5: Fix missing braces in commands
    const commandsWithBraces = ['\\node', '\\draw', '\\path', '\\fill', '\\filldraw'];
    for (const cmd of commandsWithBraces) {
      const cmdRegex = new RegExp(`${cmd}\\s+([^\\[{\\s][^;]*?)(;|$)`, 'g');
      fixedCode = fixedCode.replace(cmdRegex, (match, content, end) => {
        if (!content.includes('{') && !content.includes('[')) {
          fixedIssues = true;
          return `${cmd} {${content}}${end}`;
        }
        return match;
      });
    }

    return { fixedCode, fixedIssues };
  }

  /**
   * Extract library declarations from the user code
   *
   * @param code The TikZ code
   * @returns The code with library declarations removed and the extracted libraries
   */
  private extractLibraryDeclarations(code: string): { extractedCode: string, extractedLibraries: string[] } {
    const extractedLibraries: string[] = [];

    // Match \usetikzlibrary{...} declarations
    const libraryRegex = /\\usetikzlibrary\s*{([^}]*)}/g;
    let match;
    let extractedCode = code;

    // Find all library declarations
    while ((match = libraryRegex.exec(code)) !== null) {
      if (match[1]) {
        // Split by commas and trim whitespace
        const libraries = match[1].split(',').map(lib => lib.trim());
        extractedLibraries.push(...libraries);
      }
    }

    // Remove the library declarations from the code
    extractedCode = extractedCode.replace(libraryRegex, '');

    // Remove any resulting empty lines
    extractedCode = extractedCode.replace(/^\s*[\r\n]/gm, '');

    return { extractedCode, extractedLibraries };
  }

  /**
   * Build an enhanced preamble by combining user preamble with auto-detected requirements
   *
   * @param userPreamble The user-provided preamble
   * @param code The TikZ code
   * @param extractedLibraries Libraries extracted from the user code
   * @returns The enhanced preamble
   */
  private buildEnhancedPreamble(userPreamble: string, code: string, extractedLibraries: string[] = []): string {
    // Detect what's already in the user preamble
    const hasTikz = /\\usepackage\s*{.*tikz.*}/.test(userPreamble);
    const hasPgfplots = /\\usepackage\s*{.*pgfplots.*}/.test(userPreamble);
    const hasCompat = /\\pgfplotsset\s*{\s*compat/.test(userPreamble);
    const hasSiunitx = /\\usepackage\s*{.*siunitx.*}/.test(userPreamble);
    const hasAmsmath = /\\usepackage\s*{.*amsmath.*}/.test(userPreamble);
    const hasAmssymb = /\\usepackage\s*{.*amssymb.*}/.test(userPreamble);

    // Start with user preamble
    let enhancedPreamble = userPreamble;

    // Add missing essential packages
    if (!hasTikz) {
      enhancedPreamble += '\n\\usepackage{tikz}';
    }

    // Add pgfplots if needed
    if (!hasPgfplots && this.needsPgfplots(code)) {
      enhancedPreamble += '\n\\usepackage{pgfplots}';
    }

    // Add pgfplots compat if needed
    if (!hasCompat && (hasPgfplots || this.needsPgfplots(code))) {
      enhancedPreamble += '\n\\pgfplotsset{compat=1.18}';
    }

    // Add siunitx if needed
    if (!hasSiunitx && this.needsSiunitx(code)) {
      enhancedPreamble += '\n\\usepackage{siunitx}';
    }

    // Add amsmath if needed
    if (!hasAmsmath && this.needsAmsmath(code)) {
      enhancedPreamble += '\n\\usepackage{amsmath}';
    }

    // Add amssymb if needed
    if (!hasAmssymb && this.needsAmssymb(code)) {
      enhancedPreamble += '\n\\usepackage{amssymb}';
    }

    // Combine auto-detected libraries with those extracted from the user code
    const detectedLibraries = this.detectRequiredLibraries(code);
    const allLibraries = [...new Set([...detectedLibraries, ...extractedLibraries])];

    if (allLibraries.length > 0) {
      // Check if the user preamble already includes these libraries
      const userLibraries = this.extractUserLibraries(userPreamble);
      const newLibraries = allLibraries.filter(lib => !userLibraries.includes(lib));

      if (newLibraries.length > 0) {
        this.logger.info(`Adding libraries to preamble: ${newLibraries.join(', ')}`);
        console.log(`Adding TikZ libraries to preamble: ${newLibraries.join(', ')}`);
        enhancedPreamble += `\n\\usetikzlibrary{${newLibraries.join(',')}}`;
      }
    }

    return enhancedPreamble;
  }

  /**
   * Extract TikZ libraries from user preamble
   *
   * @param preamble The user preamble
   * @returns Array of library names
   */
  private extractUserLibraries(preamble: string): string[] {
    const libraries: string[] = [];
    const regex = /\\usetikzlibrary\s*{([^}]*)}/g;
    let match;

    while ((match = regex.exec(preamble)) !== null) {
      const libs = match[1].split(',').map(lib => lib.trim());
      libraries.push(...libs);
    }

    return libraries;
  }

  /**
   * Detect required TikZ libraries based on code content
   *
   * @param code The TikZ code
   * @returns Array of required library names
   */
  private detectRequiredLibraries(code: string): string[] {
    const libraries: string[] = [];

    // Library detection rules with more specific patterns
    const libraryRules = [
      // Bayesian networks
      {
        pattern: /bayes|plate|factor|latent|obs|edge\s*{|node\s*\[\s*latent\s*\]|node\s*\[\s*obs\s*\]/i,
        library: 'bayesnet',
        description: 'Bayesian network components'
      },

      // Circuits
      {
        pattern: /circuit|to\[open|to\[closed|logic gate/i,
        library: 'circuits',
        description: 'Circuit diagrams'
      },

      // Mindmaps
      {
        pattern: /mindmap|concept/i,
        library: 'mindmap',
        description: 'Mind maps'
      },

      // Graphs
      {
        pattern: /\\graph|node\s*\[|edge\s*\[/i,
        library: 'graphs',
        description: 'Graph structures'
      },

      // Trees
      {
        pattern: /\\Tree|child\s*{|grow/i,
        library: 'trees',
        description: 'Tree structures'
      },

      // Arrows
      {
        pattern: /-Stealth|->|<-|>=|<=|<->|Latex|Computer Modern/i,
        library: 'arrows.meta',
        description: 'Arrow styles and tips'
      },

      // Calculations
      {
        pattern: /\\calc|let\s+\\p|\\coordinate\s*\(|\$\(.*\)|\$\(.*\+.*\)|\$\(.*\-.*\)|\$\(.*\*.*\)|\$\(.*\/.*\)/i,
        library: 'calc',
        description: 'Coordinate calculations'
      },

      // Spy functionality
      {
        pattern: /\\spy|magnify/i,
        library: 'spy',
        description: 'Magnification of parts of the picture'
      },

      // Matrices
      {
        pattern: /matrix\s+of\s+nodes|\\matrix|m\{/i,
        library: 'matrix',
        description: 'Matrix structures'
      },

      // Patterns
      {
        pattern: /pattern\s*=|hatch|crosshatch|dots|grid|north east lines/i,
        library: 'patterns',
        description: 'Fill patterns'
      },

      // Shadings
      {
        pattern: /shade|radial|ball|axis/i,
        library: 'shadings',
        description: 'Shading effects'
      },

      // Positioning
      {
        pattern: /above\s*=|below\s*=|left\s*=|right\s*=|above\s+of|below\s+of|left\s+of|right\s+of|above\s+left|above\s+right|below\s+left|below\s+right|right\s*=\s*of|left\s*=\s*of|above\s*=\s*of|below\s*=\s*of/i,
        library: 'positioning',
        description: 'Node positioning'
      },

      // Automata
      {
        pattern: /automata|state\s*\[|accepting|initial|loop/i,
        library: 'automata',
        description: 'State machines and automata'
      },

      // Bending
      {
        pattern: /bend\s+left|bend\s+right|in\s*=|out\s*=/i,
        library: 'bending',
        description: 'Path bending'
      },

      // Calendar
      {
        pattern: /\\calendar|day list|month list|week list/i,
        library: 'calendar',
        description: 'Calendar diagrams'
      },

      // Chains
      {
        pattern: /\\chainin|chain|join/i,
        library: 'chains',
        description: 'Chained objects'
      },

      // ER diagrams
      {
        pattern: /er\s+diagram|entity|relationship/i,
        library: 'er',
        description: 'Entity-relationship diagrams'
      },

      // Fitting
      {
        pattern: /\\node\s*\[\s*fit\s*=|fit\s*=\s*\(/i,
        library: 'fit',
        description: 'Fitting nodes around other nodes'
      },

      // Folding
      {
        pattern: /folding|fold/i,
        library: 'folding',
        description: 'Folding marks'
      },

      // Intersections
      {
        pattern: /name\s+path|name\s+intersections|intersection/i,
        library: 'intersections',
        description: 'Path intersections'
      },

      // Hobby paths
      {
        pattern: /hobby|through|smooth/i,
        library: 'hobby',
        description: 'Smooth curves through points'
      },

      // Lindenmayer systems
      {
        pattern: /lindenmayer|l-system/i,
        library: 'lindenmayersystems',
        description: 'L-systems for fractals'
      },

      // Petri nets
      {
        pattern: /petri|place|transition/i,
        library: 'petri',
        description: 'Petri nets'
      },

      // Plot handlers
      {
        pattern: /plot\s+handler|scatter|smooth|comb|bar/i,
        library: 'plothandlers',
        description: 'Plot handlers'
      },

      // Geometric shapes
      {
        pattern: /circle|ellipse|rectangle|diamond|trapezium|semicircle|regular\s+polygon|star|cylinder|sphere|dart|isosceles\s+triangle|kite|rounded\s+rectangle/i,
        library: 'shapes.geometric',
        description: 'Geometric shapes'
      },

      // Miscellaneous shapes
      {
        pattern: /cross\s+out|strike\s+out|rounded\s+rectangle|chamfered\s+rectangle/i,
        library: 'shapes.misc',
        description: 'Miscellaneous shapes'
      },

      // Symbol shapes
      {
        pattern: /forbidden\s+sign|magnifying\s+glass|cloud|starburst|signal|tape/i,
        library: 'shapes.symbols',
        description: 'Symbol shapes'
      },

      // Arrow shapes
      {
        pattern: /single\s+arrow|double\s+arrow|arrow\s+box/i,
        library: 'shapes.arrows',
        description: 'Arrow shapes'
      },

      // Multipart shapes
      {
        pattern: /circle\s+split|rectangle\s+split|text\s+width\s+split/i,
        library: 'shapes.multipart',
        description: 'Multipart shapes'
      },

      // Callout shapes
      {
        pattern: /callout|cloud\s+callout|ellipse\s+callout|rectangle\s+callout/i,
        library: 'shapes.callouts',
        description: 'Callout shapes'
      },

      // Path morphing decorations
      {
        pattern: /decorate|decoration\s*=\s*zigzag|decoration\s*=\s*snake|decoration\s*=\s*coil|decoration\s*=\s*bumps/i,
        library: 'decorations.pathmorphing',
        description: 'Path morphing decorations'
      },

      // Path replacing decorations
      {
        pattern: /decoration\s*=\s*brace|decoration\s*=\s*expanding\s+waves|decoration\s*=\s*border/i,
        library: 'decorations.pathreplacing',
        description: 'Path replacing decorations'
      },

      // Markings decorations
      {
        pattern: /decoration\s*=\s*markings|arrow\s*=\s*at\s+position/i,
        library: 'decorations.markings',
        description: 'Markings decorations'
      },

      // Text decorations
      {
        pattern: /decoration\s*=\s*text|text\s+along\s+path/i,
        library: 'decorations.text',
        description: 'Text decorations'
      },

      // Fractal decorations
      {
        pattern: /decoration\s*=\s*Koch\s+snowflake|decoration\s*=\s*Koch\s+curve/i,
        library: 'decorations.fractals',
        description: 'Fractal decorations'
      },

      // Footprint decorations
      {
        pattern: /decoration\s*=\s*footprints|decoration\s*=\s*foot\s+prints/i,
        library: 'decorations.footprints',
        description: 'Footprint decorations'
      },

      // External graphics
      {
        pattern: /\\tikzexternalize|external/i,
        library: 'external',
        description: 'External graphics'
      },

      // Fadings
      {
        pattern: /\\tikzfading|fading\s*=|fade/i,
        library: 'fadings',
        description: 'Fadings'
      },

      // Perspective
      {
        pattern: /perspective|canvas\s+is\s+xy\s+plane\s+at\s+z/i,
        library: 'perspective',
        description: 'Perspective'
      },

      // 3D
      {
        pattern: /xyz\s+spherical|canvas\s+is\s+xy\s+plane|3d|tikz-3dplot/i,
        library: '3d',
        description: '3D drawing'
      },

      // Backgrounds
      {
        pattern: /background\s+rectangle|framed|show\s+background\s+rectangle|on\s+background\s+layer|begin\s*{\s*scope\s*}\s*\[\s*on\s+background\s+layer\s*\]/i,
        library: 'backgrounds',
        description: 'Background rectangles and frames'
      },

      // Quotes
      {
        pattern: /["']--["']|["']-["']/i,
        library: 'quotes',
        description: 'Edge quotes'
      },

      // Angles
      {
        pattern: /pic\s*\{\s*angle|pic\s*\{\s*right\s+angle/i,
        library: 'angles',
        description: 'Drawing angles'
      },

      // Datavisualization
      {
        pattern: /\\datavisualization/i,
        library: 'datavisualization',
        description: 'Data visualization'
      },

      // Topaths
      {
        pattern: /to\s+path|edge\s+path/i,
        library: 'topaths',
        description: 'Path specifications'
      }
    ];

    for (const rule of libraryRules) {
      if (rule.pattern.test(code)) {
        libraries.push(rule.library);
        this.logger.debug(`Detected library: ${rule.library} (${rule.description})`);
      }
    }

    return libraries;
  }

  /**
   * Check if the code needs pgfplots
   */
  private needsPgfplots(code: string): boolean {
    return /\\begin\s*{\s*axis\s*}|\\begin\s*{\s*semilogxaxis\s*}|\\begin\s*{\s*semilogyaxis\s*}|\\begin\s*{\s*loglogaxis\s*}|\\addplot/.test(code);
  }

  /**
   * Check if the code needs siunitx
   */
  private needsSiunitx(code: string): boolean {
    return /\\si\s*{|\\SI\s*{|\\celsius|\\degree|\\ohm|\\micro|\\nano|\\kilo|\\mega|\\giga|\\tera|\\pico|\\femto/.test(code);
  }

  /**
   * Check if the code needs amsmath
   */
  private needsAmsmath(code: string): boolean {
    return /\\begin\s*{\s*align\s*}|\\begin\s*{\s*equation\s*}|\\begin\s*{\s*gather\s*}|\\begin\s*{\s*multline\s*}|\\tag|\\notag|\\text|\\intertext|\\substack|\\overset|\\underset|\\dfrac|\\tfrac|\\binom|\\dbinom|\\tbinom|\\vdots|\\ddots|\\hdots|\\cdots/.test(code);
  }

  /**
   * Check if the code needs amssymb
   */
  private needsAmssymb(code: string): boolean {
    return /\\mathbb|\\mathfrak|\\mathcal|\\mathscr|\\blacksquare|\\square|\\blacktriangle|\\triangle|\\blacklozenge|\\lozenge|\\bigstar|\\angle|\\measuredangle|\\sphericalangle|\\circledS|\\circledR|\\circledast|\\circleddash|\\boxplus|\\boxminus|\\boxtimes|\\boxdot|\\leqslant|\\geqslant|\\lesssim|\\gtrsim|\\lessgtr|\\gtrless/.test(code);
  }

  /**
   * Suggest libraries based on error message
   *
   * @param errorMessage The LaTeX error message
   * @returns Suggested libraries and packages
   */
  public suggestLibraries(errorMessage: string): { libraries: string[], packages: string[] } {
    const suggestions = {
      libraries: [] as string[],
      packages: [] as string[]
    };

    // Check for undefined control sequences
    const undefinedCommandMatch = errorMessage.match(/Undefined control sequence.*\\([a-zA-Z]+)/);
    if (undefinedCommandMatch) {
      const command = undefinedCommandMatch[1];

      // Suggest libraries based on command
      if (/^(edge|plate|factor|latent|obs)$/.test(command)) {
        suggestions.libraries.push('bayesnet');
      } else if (/^(state|accepting|initial)$/.test(command)) {
        suggestions.libraries.push('automata');
      } else if (/^(cylinder|ellipse|diamond|star|regular)$/.test(command)) {
        suggestions.libraries.push('shapes.geometric');
      } else if (/^(addplot|axis|semilogxaxis|semilogyaxis|loglogaxis)$/.test(command)) {
        suggestions.packages.push('pgfplots');
      } else if (/^(matrix|m)$/.test(command)) {
        suggestions.libraries.push('matrix');
      } else if (/^(spy|magnify)$/.test(command)) {
        suggestions.libraries.push('spy');
      } else if (/^(decorate|decoration)$/.test(command)) {
        suggestions.libraries.push('decorations.pathmorphing');
      } else if (/^(fit)$/.test(command)) {
        suggestions.libraries.push('fit');
      } else if (/^(graph|Graph)$/.test(command)) {
        suggestions.libraries.push('graphs');
      } else if (/^(Stealth|Latex|Computer)$/.test(command)) {
        suggestions.libraries.push('arrows.meta');
      } else if (/^(above|below|left|right)$/.test(command)) {
        suggestions.libraries.push('positioning');
      } else if (/^(siunitx|SI|si|celsius|ohm)$/.test(command)) {
        suggestions.packages.push('siunitx');
      } else if (/^(mathbb|mathfrak|mathcal)$/.test(command)) {
        suggestions.packages.push('amssymb');
      } else if (/^(align|gather|multline|tag)$/.test(command)) {
        suggestions.packages.push('amsmath');
      }
    }

    // Check for missing packages
    const missingPackageMatch = errorMessage.match(/File [`']([^']+)[`'] not found/);
    if (missingPackageMatch) {
      const packageName = missingPackageMatch[1];
      suggestions.packages.push(packageName);
    }

    // Check for common error patterns
    if (errorMessage.includes('Missing $ inserted')) {
      this.logger.info('Detected math mode error, suggesting amsmath package');
      suggestions.packages.push('amsmath');
    }

    if (errorMessage.includes('Paragraph ended before') && errorMessage.includes('axis')) {
      this.logger.info('Detected axis environment error, suggesting pgfplots package');
      suggestions.packages.push('pgfplots');
    }

    if (errorMessage.includes('Paragraph ended before') && errorMessage.includes('tikzpicture')) {
      this.logger.info('Detected tikzpicture environment error, suggesting tikz package');
      // No need to suggest tikz package as it's always included
    }

    // Remove duplicates
    suggestions.libraries = [...new Set(suggestions.libraries)];
    suggestions.packages = [...new Set(suggestions.packages)];

    return suggestions;
  }
}
