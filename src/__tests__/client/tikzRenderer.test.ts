import { TikZRenderer } from '../../client/tikzRenderer';
import TikZAdvancedPlugin from '../../main';
import { TikZRenderResult } from '../../shared/types';

// Mock the plugin
const mockPlugin = {
  settings: {
    defaultOutputFormat: 'svg',
    enableZoom: true,
    cacheEnabled: true,
    cacheTTL: 60,
    preferredEngine: 'pdflatex',
    customPreamble: '\\usepackage{tikz}',
    showCacheIndicator: true
  },
  cache: {
    get: jest.fn(),
    set: jest.fn()
  },
  serverConnector: {
    renderTikZ: jest.fn()
  }
} as unknown as TikZAdvancedPlugin;

// Mock HTML elements
class MockElement {
  children: MockElement[] = [];
  classList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn().mockReturnValue(false),
    toggle: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn()
  };
  style = {};
  innerHTML = '';
  textContent = '';

  createDiv(options?: { cls?: string }) {
    const div = new MockElement();
    if (options?.cls) {
      div.classList.add(options.cls);
    }
    this.children.push(div);
    return div;
  }

  createSpan(options?: { text?: string; cls?: string }) {
    const span = new MockElement();
    if (options?.text) {
      span.textContent = options.text;
    }
    if (options?.cls) {
      span.classList.add(options.cls);
    }
    this.children.push(span);
    return span;
  }

  createEl(tagName: string, options?: { text?: string }) {
    const el = new MockElement();
    if (options?.text) {
      el.textContent = options.text;
    }
    this.children.push(el);
    return el;
  }

  empty() {
    this.children = [];
    this.innerHTML = '';
    return this;
  }

  setText(text: string) {
    this.textContent = text;
    return this;
  }

  remove() {
    return this;
  }

  addEventListener(event: string, callback: () => void) {}
}

describe('TikZRenderer', () => {
  let renderer: TikZRenderer;
  let containerEl: MockElement;
  let mockContext: any;

  beforeEach(() => {
    renderer = new TikZRenderer(mockPlugin);
    containerEl = new MockElement();
    mockContext = {};

    // Reset mocks
    mockPlugin.cache.get.mockReset();
    mockPlugin.cache.set.mockReset();
    mockPlugin.serverConnector.renderTikZ.mockReset();
  });

  test('should create toolbar and content elements', async () => {
    await renderer.render('\\begin{tikzpicture}\\end{tikzpicture}', containerEl as any, mockContext);

    // Check if container has tikz-container class
    expect(containerEl.children.length).toBeGreaterThan(0);
    expect(containerEl.children[0].classList.add).toHaveBeenCalledWith('tikz-container');

    // Check if toolbar was created
    const tikzContainer = containerEl.children[0];
    expect(tikzContainer.children.length).toBeGreaterThan(0);
    expect(tikzContainer.children[0].classList.add).toHaveBeenCalledWith('tikz-toolbar');

    // Check if content area was created
    expect(tikzContainer.children.length).toBeGreaterThan(1);
    expect(tikzContainer.children[1].classList.add).toHaveBeenCalledWith('tikz-content');
  });

  test('should try to get from cache first if caching is enabled', async () => {
    const mockResult: TikZRenderResult = {
      content: '<svg></svg>',
      format: 'svg'
    };

    mockPlugin.cache.get.mockReturnValue(mockResult);

    await renderer.render('\\begin{tikzpicture}\\end{tikzpicture}', containerEl as any, mockContext);

    expect(mockPlugin.cache.get).toHaveBeenCalled();
    expect(mockPlugin.serverConnector.renderTikZ).not.toHaveBeenCalled();
  });

  test('should render from server if not in cache', async () => {
    const mockResult: TikZRenderResult = {
      content: '<svg></svg>',
      format: 'svg'
    };

    mockPlugin.cache.get.mockReturnValue(null);
    mockPlugin.serverConnector.renderTikZ.mockResolvedValue(mockResult);

    await renderer.render('\\begin{tikzpicture}\\end{tikzpicture}', containerEl as any, mockContext);

    expect(mockPlugin.cache.get).toHaveBeenCalled();
    expect(mockPlugin.serverConnector.renderTikZ).toHaveBeenCalled();
    expect(mockPlugin.cache.set).toHaveBeenCalled();
  });

  test('should handle rendering errors', async () => {
    mockPlugin.cache.get.mockReturnValue(null);
    mockPlugin.serverConnector.renderTikZ.mockRejectedValue(new Error('Test error'));

    await renderer.render('\\begin{tikzpicture}\\end{tikzpicture}', containerEl as any, mockContext);

    // Check if error element is displayed
    const tikzContainer = containerEl.children[0];
    expect(tikzContainer.children.some(child => 
      child.classList.add.mock.calls.some(call => call[0] === 'tikz-error')
    )).toBeTruthy();
  });
});
