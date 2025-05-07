import { exec } from 'child_process';

interface Dependencies {
  pdflatex: boolean;
  lualatex: boolean;
  xelatex: boolean;
  pdf2svg: boolean;
  inkscape: boolean;
}

/**
 * Check if the required dependencies are installed
 */
export async function checkDependencies(): Promise<Dependencies> {
  const dependencies: Dependencies = {
    pdflatex: false,
    lualatex: false,
    xelatex: false,
    pdf2svg: false,
    inkscape: false
  };

  // Check LaTeX engines
  dependencies.pdflatex = await checkCommand('pdflatex --version');
  dependencies.lualatex = await checkCommand('lualatex --version');
  dependencies.xelatex = await checkCommand('xelatex --version');

  // Check PDF to SVG conversion tools
  dependencies.pdf2svg = await checkCommand('pdf2svg --version') || await checkCommand('which pdf2svg');
  dependencies.inkscape = await checkCommand('inkscape --version');

  return dependencies;
}

/**
 * Check if a command is available
 */
async function checkCommand(command: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    exec(command, (error: any) => {
      resolve(!error);
    });
  });
}
