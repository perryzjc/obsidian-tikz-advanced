import { TikZServerConnector } from '../../client/tikzServerConnector';
import TikZAdvancedPlugin from '../../main';
import { requestUrl } from 'obsidian';

// Mock obsidian's requestUrl
jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
  Notice: jest.fn()
}));

// Mock the plugin
const mockPlugin = {
  settings: {
    serverUrl: 'http://localhost:3000',
    debugMode: false,
    preferredEngine: 'pdflatex',
    customPreamble: '\\usepackage{tikz}'
  }
} as unknown as TikZAdvancedPlugin;

describe('TikZServerConnector', () => {
  let connector: TikZServerConnector;

  beforeEach(() => {
    connector = new TikZServerConnector(mockPlugin);
    (requestUrl as jest.Mock).mockReset();
  });

  test('should test connection successfully', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 200,
      json: { status: 'ok' }
    });

    const result = await connector.testConnection();
    
    expect(result).toBe(true);
    expect(requestUrl).toHaveBeenCalledWith({
      url: 'http://localhost:3000/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  test('should handle connection test failure', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 500,
      json: { status: 'error' }
    });

    const result = await connector.testConnection();
    
    expect(result).toBe(false);
  });

  test('should handle connection test error', async () => {
    (requestUrl as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await connector.testConnection();
    
    expect(result).toBe(false);
  });

  test('should render TikZ successfully', async () => {
    const mockResponse = {
      status: 200,
      json: {
        content: '<svg></svg>',
        width: 100,
        height: 100
      }
    };
    
    (requestUrl as jest.Mock).mockResolvedValue(mockResponse);

    const result = await connector.renderTikZ(
      '\\begin{tikzpicture}\\end{tikzpicture}',
      'svg',
      'pdflatex'
    );
    
    expect(result).toEqual({
      content: '<svg></svg>',
      format: 'svg',
      width: 100,
      height: 100
    });
    
    expect(requestUrl).toHaveBeenCalledWith({
      url: 'http://localhost:3000/render',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tikzCode: '\\begin{tikzpicture}\\end{tikzpicture}',
        format: 'svg',
        engine: 'pdflatex',
        preamble: '\\usepackage{tikz}'
      })
    });
  });

  test('should handle rendering error from server', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 200,
      json: {
        error: 'LaTeX error'
      }
    });

    await expect(connector.renderTikZ(
      '\\begin{tikzpicture}\\end{tikzpicture}',
      'svg',
      'pdflatex'
    )).rejects.toThrow('LaTeX error');
  });

  test('should handle server error status', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 500,
      text: 'Internal server error'
    });

    await expect(connector.renderTikZ(
      '\\begin{tikzpicture}\\end{tikzpicture}',
      'svg',
      'pdflatex'
    )).rejects.toThrow('Server returned status 500');
  });

  test('should handle network error', async () => {
    (requestUrl as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(connector.renderTikZ(
      '\\begin{tikzpicture}\\end{tikzpicture}',
      'svg',
      'pdflatex'
    )).rejects.toThrow('Network error');
  });
});
