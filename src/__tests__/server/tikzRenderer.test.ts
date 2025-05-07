import { TikZRenderer } from '../../server/tikzRenderer';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

// Mock fs, path, and child_process
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('../../server/dependencyChecker', () => ({
  checkDependencies: jest.fn().mockResolvedValue({
    pdflatex: true,
    lualatex: true,
    xelatex: true,
    pdf2svg: true,
    inkscape: false
  })
}));

describe('TikZRenderer', () => {
  let renderer: TikZRenderer;

  beforeEach(() => {
    // Reset mocks
    (fs.existsSync as jest.Mock).mockReset();
    (fs.mkdirSync as jest.Mock).mockReset();
    (fs.writeFileSync as jest.Mock).mockReset();
    (fs.readFileSync as jest.Mock).mockReset();
    (exec as jest.Mock).mockReset();

    // Setup default mock behavior
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path.toString().endsWith('.svg')) {
        return '<svg width="100" height="100"></svg>';
      } else if (path.toString().endsWith('.pdf')) {
        return Buffer.from('pdf-content');
      }
      return '';
    });

    // Mock successful command execution
    (exec as jest.Mock).mockImplementation((command, callback) => {
      callback(null, 'success', '');
    });

    renderer = new TikZRenderer();
  });

  test('should create temp directory if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
    
    new TikZRenderer();
    
    expect(fs.mkdirSync).toHaveBeenCalled();
  });

  test('should render TikZ to SVG successfully', async () => {
    const result = await renderer.render(
      '\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}',
      'svg',
      'pdflatex'
    );
    
    expect(result).toEqual({
      content: '<svg width="100" height="100"></svg>',
      format: 'svg',
      width: 100,
      height: 100
    });
    
    // Check if LaTeX document was created
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Check if LaTeX was compiled
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('pdflatex'),
      expect.any(Function)
    );
    
    // Check if PDF was converted to SVG
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('pdf2svg'),
      expect.any(Function)
    );
  });

  test('should render TikZ to PDF successfully', async () => {
    const result = await renderer.render(
      '\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}',
      'pdf',
      'pdflatex'
    );
    
    expect(result).toEqual({
      content: 'cGRmLWNvbnRlbnQ=', // Base64 encoded 'pdf-content'
      format: 'pdf'
    });
    
    // Check if LaTeX was compiled
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('pdflatex'),
      expect.any(Function)
    );
    
    // Check that PDF to SVG conversion was not called
    expect(exec).not.toHaveBeenCalledWith(
      expect.stringContaining('pdf2svg'),
      expect.any(Function)
    );
  });

  test('should handle LaTeX compilation error', async () => {
    (exec as jest.Mock).mockImplementationOnce((command, callback) => {
      if (command.includes('pdflatex')) {
        callback(new Error('LaTeX error'), '! Undefined control sequence.', '');
      } else {
        callback(null, 'success', '');
      }
    });
    
    await expect(renderer.render(
      '\\begin{tikzpicture}\\undefinedcommand\\end{tikzpicture}',
      'svg',
      'pdflatex'
    )).rejects.toThrow('Undefined control sequence');
  });

  test('should try alternative SVG conversion if pdf2svg fails', async () => {
    // First exec call (pdflatex) succeeds
    // Second exec call (pdf2svg) fails
    // Third exec call (inkscape) succeeds
    (exec as jest.Mock)
      .mockImplementationOnce((command, callback) => {
        callback(null, 'success', '');
      })
      .mockImplementationOnce((command, callback) => {
        if (command.includes('pdf2svg')) {
          callback(new Error('pdf2svg not found'), '', 'Command not found');
        } else {
          callback(null, 'success', '');
        }
      });
    
    const result = await renderer.render(
      '\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}',
      'svg',
      'pdflatex'
    );
    
    expect(result).toEqual({
      content: '<svg width="100" height="100"></svg>',
      format: 'svg',
      width: 100,
      height: 100
    });
    
    // Check if alternative conversion was attempted
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('inkscape'),
      expect.any(Function)
    );
  });

  test('should throw error if LaTeX engine is not available', async () => {
    const checkDependencies = require('../../server/dependencyChecker').checkDependencies;
    checkDependencies.mockResolvedValueOnce({
      pdflatex: false,
      lualatex: false,
      xelatex: false,
      pdf2svg: true,
      inkscape: false
    });
    
    await expect(renderer.render(
      '\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}',
      'svg',
      'pdflatex'
    )).rejects.toThrow('LaTeX engine pdflatex is not available');
  });
});
