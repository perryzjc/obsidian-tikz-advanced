// This file is used to set up the test environment
// Add any global setup code here

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Uncomment to suppress specific console methods during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Add any global mocks here
