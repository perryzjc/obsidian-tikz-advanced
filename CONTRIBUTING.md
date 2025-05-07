# Contributing to TikZ Advanced Plugin

Thank you for considering contributing to the TikZ Advanced Plugin! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing](#testing)
7. [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- LaTeX distribution with pdfLaTeX, LuaLaTeX, and/or XeLaTeX
- pdf2svg or Inkscape for SVG conversion

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/perryzjc/obsidian-tikz-advanced.git
   cd obsidian-tikz-advanced
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the plugin and set up the server using the provided script:
   ```bash
   ./tikz-tools.sh build
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the [coding standards](#coding-standards)

3. Run the development build with hot reloading:
   ```bash
   ./tikz-tools.sh dev
   ```

4. Start the TikZ rendering server:
   ```bash
   ./tikz-tools.sh server
   ```

5. Test your changes thoroughly:
   ```bash
   ./tikz-tools.sh test
   ```

6. Commit your changes using [conventional commit messages](#commit-message-format):
   ```bash
   git commit -m "feat: Add new feature"
   ```

7. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a Pull Request from your fork to the main repository

## Pull Request Process

1. Ensure your code follows the [coding standards](#coding-standards)
2. Update the documentation with details of changes
3. Add tests for your changes
4. Ensure all tests pass
5. Update the README.md or other documentation if necessary
6. The PR will be merged once it receives approval from maintainers

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Use interfaces for complex data structures
- Use proper typing for all variables and functions

### Commit Message Format

Use conventional commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

Example:
```
feat(renderer): Add support for XeLaTeX engine

Add support for the XeLaTeX engine to render TikZ diagrams with custom fonts.

Closes #123
```

## Testing

### Running Tests

Run all tests using the provided script:
```bash
./tikz-tools.sh test
```

Test specific examples:
```bash
./tikz-tools.sh test-example examples/categories/basic/circles_and_shapes.md
```

### Writing Tests

- Write tests for all new features and bug fixes
- Place tests in the `src/__tests__` directory
- Follow the existing test structure
- Use descriptive test names
- Test both success and failure cases

## Documentation

- Update documentation for all new features and changes
- Document public APIs
- Add examples for new features
- Keep the README.md up to date
- Add JSDoc comments to functions and classes

Thank you for contributing to the TikZ Advanced Plugin!
