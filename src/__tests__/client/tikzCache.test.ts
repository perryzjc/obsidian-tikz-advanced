import { TikZCache } from '../../client/tikzCache';
import TikZAdvancedPlugin from '../../main';
import { TikZRenderResult } from '../../shared/types';

// Mock Date.now to control time
const originalDateNow = Date.now;
let mockNow = 1000000;

beforeEach(() => {
  Date.now = jest.fn(() => mockNow);
});

afterEach(() => {
  Date.now = originalDateNow;
});

// Mock the plugin
const mockPlugin = {
  settings: {
    cacheTTL: 60, // 60 minutes
    preferredEngine: 'pdflatex',
    customPreamble: '\\usepackage{tikz}'
  }
} as unknown as TikZAdvancedPlugin;

describe('TikZCache', () => {
  let cache: TikZCache;

  beforeEach(() => {
    cache = new TikZCache(mockPlugin);
    mockNow = 1000000; // Reset mock time
  });

  test('should store and retrieve cache entries', () => {
    const mockResult: TikZRenderResult = {
      content: '<svg></svg>',
      format: 'svg'
    };

    cache.set('test code', mockResult);
    const result = cache.get('test code', 'svg');

    expect(result).toEqual(mockResult);
  });

  test('should return null for non-existent cache entries', () => {
    const result = cache.get('non-existent', 'svg');
    expect(result).toBeNull();
  });

  test('should return null for expired cache entries', () => {
    const mockResult: TikZRenderResult = {
      content: '<svg></svg>',
      format: 'svg'
    };

    cache.set('test code', mockResult);
    
    // Advance time beyond TTL
    mockNow += (mockPlugin.settings.cacheTTL + 1) * 60 * 1000;
    
    const result = cache.get('test code', 'svg');
    expect(result).toBeNull();
  });

  test('should clear all cache entries', () => {
    const mockResult: TikZRenderResult = {
      content: '<svg></svg>',
      format: 'svg'
    };

    cache.set('test code 1', mockResult);
    cache.set('test code 2', mockResult);
    
    cache.clear();
    
    expect(cache.get('test code 1', 'svg')).toBeNull();
    expect(cache.get('test code 2', 'svg')).toBeNull();
  });

  test('should clear only expired cache entries', () => {
    const mockResult1: TikZRenderResult = {
      content: '<svg>1</svg>',
      format: 'svg'
    };

    const mockResult2: TikZRenderResult = {
      content: '<svg>2</svg>',
      format: 'svg'
    };

    cache.set('test code 1', mockResult1);
    
    // Advance time a bit
    mockNow += 10 * 60 * 1000; // 10 minutes
    
    cache.set('test code 2', mockResult2);
    
    // Advance time beyond TTL for the first entry but not the second
    mockNow += (mockPlugin.settings.cacheTTL - 5) * 60 * 1000;
    
    cache.clearExpired();
    
    expect(cache.get('test code 1', 'svg')).toBeNull();
    expect(cache.get('test code 2', 'svg')).toEqual(mockResult2);
  });

  test('should use different cache keys for different formats', () => {
    const svgResult: TikZRenderResult = {
      content: '<svg></svg>',
      format: 'svg'
    };

    const pdfResult: TikZRenderResult = {
      content: 'pdf-data',
      format: 'pdf'
    };

    cache.set('test code', svgResult);
    
    // Same code but different format should have a different cache key
    const mockResultWithDifferentFormat = { ...pdfResult };
    cache.set('test code', mockResultWithDifferentFormat);
    
    expect(cache.get('test code', 'svg')).toEqual(svgResult);
    expect(cache.get('test code', 'pdf')).toEqual(pdfResult);
  });
});
