/**
 * Test script for error handling in the TikZ server
 * 
 * This script sends various TikZ code examples to the server to test error handling
 */

const fetch = require('node-fetch');

// Server URL
const SERVER_URL = 'http://localhost:3000';

// Test cases with expected errors
const TEST_CASES = [
  {
    name: 'Undefined command',
    tikzCode: `\\begin{tikzpicture}
\\drai23w (0,0) circle (1cm);
\\end{tikzpicture}`,
    preamble: `\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`
  },
  {
    name: 'Missing siunitx',
    tikzCode: `\\begin{tikzpicture}
\\draw (0,0) node {Temperature: 25\\celsius};
\\end{tikzpicture}`,
    preamble: `\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`
  },
  {
    name: 'Syntax error',
    tikzCode: `\\begin{tikzpicture}
\\draw (0,0) -- (1,1) -- (2,0) -- cycle;
\\draw (1,1) -- (3,1) -- (2,2) -- ;
\\end{tikzpicture}`,
    preamble: `\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}`
  }
];

/**
 * Send a test case to the server
 */
async function testCase(testCase) {
  console.log(`\n=== Testing: ${testCase.name} ===`);
  
  try {
    const response = await fetch(`${SERVER_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tikzCode: testCase.tikzCode,
        preamble: testCase.preamble,
        format: 'svg',
        engine: 'pdflatex'
      })
    });
    
    const result = await response.json();
    
    if (result.success === false) {
      console.log('Error detected (expected)');
      console.log('Error message:', result.error);
      
      if (result.errorInfo) {
        console.log('Error type:', result.errorInfo.errorType || 'unknown');
        console.log('Suggestion:', result.errorInfo.suggestion || 'none');
        
        if (result.errorInfo.progressiveNote) {
          console.log('Progressive note:', result.errorInfo.progressiveNote);
        }
      }
      
      console.log('Has HTML error:', !!result.errorHTML);
    } else {
      console.log('Rendering succeeded (unexpected)');
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

/**
 * Run all test cases
 */
async function runTests() {
  console.log('Starting error handling tests...');
  
  for (const testCase of TEST_CASES) {
    await testCase(testCase);
  }
  
  console.log('\nAll tests completed');
}

// Check if server is running
fetch(`${SERVER_URL}/health`)
  .then(response => {
    if (response.ok) {
      console.log('Server is running, starting tests...');
      runTests();
    } else {
      console.error('Server is not responding correctly');
    }
  })
  .catch(error => {
    console.error('Server is not running:', error.message);
    console.log('Please start the server with: ./tikz-tools.sh start');
  });
