# Smart TikZ Compatibility Features

The TikZ Advanced Plugin includes smart compatibility features that make it more robust and user-friendly when handling various TikZ code styles and common errors.

## Overview

The smart compatibility system uses a layered approach to improve the success rate of TikZ rendering:

1. **Smart Document Structure Detection**: Automatically detects and adapts to different document structures in user code
2. **Automatic Library Detection**: Identifies required TikZ libraries based on code content
3. **Progressive Rendering**: Tries multiple rendering strategies if the initial attempt fails
4. **Intelligent Error Handling**: Provides specific suggestions for common errors

## Smart Document Structure Detection

The system can handle various input styles:

- **Complete LaTeX Documents**: If your code includes `\\documentclass`, `\\begin{document}`, and `\\end{document}`, it will be used as-is
- **Partial Documents**: If your code has `\\begin{document}` but is missing other elements, the system will add the missing parts
- **TikZ Environments**: If your code has `\\begin{tikzpicture}` but no document structure, the system will add the necessary wrapper
- **Raw TikZ Code**: If your code has neither document structure nor tikzpicture environment, the system will add both

This allows you to focus on the actual TikZ content without worrying about boilerplate code.

## Automatic Library Detection

The system can detect when your code requires specific TikZ libraries and automatically include them:

```tikz
\\begin{tikzpicture}
  \\node[circle, draw] (A) at (0,0) {A};
  \\node[rectangle, draw] (B) at (2,0) {B};
  \\draw[->] (A) -- (B);
\\end{tikzpicture}
```

In this example, the system might detect that you're using node shapes and automatically include the necessary libraries.

The detection covers many common libraries:

- `arrows.meta` for advanced arrow tips
- `shapes.geometric` for geometric node shapes
- `positioning` for relative node positioning
- `calc` for coordinate calculations
- `decorations` for path decorations
- And many more

## Progressive Rendering

If the initial rendering attempt fails, the system will try multiple strategies:

1. **Strategy 1**: Render the code as-is with the provided preamble
2. **Strategy 2**: Use preprocessed code with the original preamble
3. **Strategy 3**: Use original code with an enhanced preamble
4. **Strategy 4**: Use both preprocessed code and enhanced preamble

This approach significantly improves the success rate for rendering TikZ diagrams, especially for users who may not be familiar with all the required packages and libraries.

## Intelligent Error Handling

When errors occur, the system provides specific suggestions based on the error type and code content:

- **Undefined Control Sequence**: Suggests the required package or library
  - For example, if you use `\\celsius` without the `siunitx` package, it will suggest adding it
  - If you use PGFPlots commands without the proper setup, it will suggest the correct preamble

- **Environment Errors**: Provides specific guidance for environment-related issues
  - Detects missing closing braces in environments
  - Identifies blank lines in environments that should be removed
  - Suggests fixes for common syntax errors

- **Math Mode Errors**: Suggests proper math mode usage

## Configuration

Server administrators can configure the smart compatibility features using environment variables:

- `ENABLE_PROGRESSIVE_RENDERING`: Set to `false` to disable progressive rendering (default: `true`)
- `ENABLE_SMART_PREPROCESSING`: Set to `false` to disable smart preprocessing (default: `true`)
- `MAX_RENDERING_ATTEMPTS`: Maximum number of rendering attempts for progressive rendering (default: `4`)

## Examples

### Example 1: Missing Library

**User Code:**
```tikz
\\begin{tikzpicture}
  \\node[circle, draw] (A) at (0,0) {A};
  \\draw[dashed, ->] (A) -- (2,0);
\\end{tikzpicture}
```

**System Response:**
- Detects usage of arrow tips
- Automatically includes `arrows.meta` library
- Successfully renders the diagram

### Example 2: Celsius Symbol

**User Code:**
```tikz
\\begin{tikzpicture}
\\begin{axis}[
    title={Temperature Dependence},
    xlabel={Temperature [\\textcelsius]},
    ylabel={Value},
]
\\addplot coordinates {
    (0,0) (10,10) (20,20)
};
\\end{axis}
\\end{tikzpicture}
```

**System Response:**
- Detects `\\textcelsius` command
- Adds `siunitx` package to the preamble
- Successfully renders the diagram

### Example 3: Blank Lines in Environment

**User Code:**
```tikz
\\begin{tikzpicture}
\\begin{axis}[
    title={Data Plot},
    xlabel={X},
    ylabel={Y},
]

\\addplot coordinates {
    (0,0) (1,1) (2,4)
};
\\end{axis}
\\end{tikzpicture}
```

**System Response:**
- If rendering fails due to blank line
- Preprocesses the code to remove blank lines
- Provides specific error message about blank lines in environments
- Successfully renders on second attempt

## Benefits

- **Improved User Experience**: Users can focus on their TikZ content without worrying about boilerplate code
- **Higher Success Rate**: The progressive rendering approach increases the chances of successful rendering
- **Educational Value**: Specific error messages and suggestions help users learn proper TikZ usage
- **Flexibility**: The system adapts to different user input styles
