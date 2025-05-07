# TikZ Example Testing Tools

This directory contains tools for testing and fixing TikZ examples to ensure they render correctly with the TikZ Advanced plugin.

## Overview

The testing framework consists of two main components:

1. **TikZ Example Tester**: Tests TikZ examples by sending them to the rendering server and checking if they render successfully.
2. **TikZ Example Fixer**: Analyzes failed examples and attempts to fix common issues.

## Usage

### Testing Examples

To test all TikZ examples in the `examples` directory:

```bash
./test-tikz-examples.sh
```

This will:
1. Check if the TikZ server is running
2. Send each example to the server for rendering
3. Generate a report of which examples passed and failed
4. Save the results in the `test-results` directory

You can specify a custom server URL:

```bash
./test-tikz-examples.sh --server-url=http://your-server:3000
```

### Fixing Examples

To automatically fix common issues in TikZ examples:

```bash
./fix-tikz-examples.sh
```

This will:
1. Check if the TikZ server is running
2. Try multiple fix strategies on each example
3. Save the fixed examples in the `fixed-examples` directory
4. Optionally run tests on the fixed examples

## Fix Strategies

The fixer applies several strategies to fix common issues:

1. **Common Fixes**:
   - Adding missing semicolons
   - Adding braces around foreach loop bodies
   - Fixing syntax errors

2. **Minimal Document**:
   - Wrapping the TikZ code in a minimal LaTeX document
   - Adding necessary packages

3. **Library Detection**:
   - Detecting which TikZ libraries are needed based on the code
   - Adding the appropriate `\usetikzlibrary` commands

## Output

The testing tools generate several output files:

- `test-results/summary.json`: Summary of all test results
- `test-results/report.md`: Markdown report of test results
- `test-results/*.svg`: SVG output for successful renders
- `fixed-examples/*.md`: Fixed versions of the example files

## Integration

These tools can be integrated into your development workflow:

1. **During Development**:
   - Test examples as you create them
   - Fix issues before committing

2. **Continuous Integration**:
   - Run tests automatically on pull requests
   - Ensure all examples render correctly

3. **Documentation**:
   - Generate verified examples for documentation
   - Ensure examples in the documentation work with the current version

## Extending

You can extend these tools by:

1. Adding new fix strategies in `tikz-example-fixer.ts`
2. Adding custom test cases in the `examples` directory
3. Modifying the test report format in `tikz-example-tester.ts`
