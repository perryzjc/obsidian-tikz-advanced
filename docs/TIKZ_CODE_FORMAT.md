# TikZ Code Format Guide

This guide explains the recommended format for TikZ code in the TikZ Advanced plugin for Obsidian.

## Basic TikZ Code Format

The TikZ code can be written in one of the following formats, from simplest to most complete:

### 1. Simple TikZ Commands (Simplest)

```tikz
\draw[thick, red, fill=red!20] (0,0) circle (1cm);
\node at (0,0) {Circle};
```

### 2. Complete tikzpicture Environment (Recommended)

```tikz
\begin{tikzpicture}
  \draw[thick, red, fill=red!20] (0,0) circle (1cm);
  \node at (0,0) {Circle};
\end{tikzpicture}
```

### 3. With Library Declarations (For Advanced Features)

```tikz
\usetikzlibrary{arrows.meta,positioning}
\begin{tikzpicture}
  \node (A) at (0,0) {A};
  \node[right=of A] (B) {B};
  \draw[-Stealth] (A) -- (B);
\end{tikzpicture}
```

### 4. With Package Declarations (For Special Packages)

```tikz
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\begin{tikzpicture}
\begin{axis}[title={Simple Function}]
  \addplot[blue, domain=-2:2] {x^2};
\end{axis}
\end{tikzpicture}
```

The plugin will automatically add the necessary document structure and handle all declarations appropriately.

## Flexible Syntax Support

The plugin is designed to be flexible and user-friendly. You can:

1. **Include or omit the tikzpicture environment** - The plugin will add it if missing
2. **Include or omit package declarations** - Common packages are automatically detected
3. **Include or omit library declarations** - Many libraries are automatically detected based on your code
4. **Include complete document structure** - If you prefer, you can include the full LaTeX document structure

## TikZ Libraries

### Direct Library Inclusion (Recommended)

You can include TikZ libraries directly in your code using the `\usetikzlibrary` command:

```tikz
\usetikzlibrary{bayesnet,positioning}
\begin{tikzpicture}
  \node[latent] (A) {A};
  \node[obs, right=of A] (B) {B};
  \edge {A} {B};
\end{tikzpicture}
```

The plugin will automatically extract these declarations and add them to the preamble.

### Intelligent Auto-Detection

The plugin intelligently detects required libraries based on your code. For example, if you use:

- Bayesian network components (`latent`, `obs`, `edge`) → `bayesnet` library
- Positioning commands (`right=of`, `above=of`) → `positioning` library
- Special shapes (`cylinder`, `diamond`) → appropriate `shapes` libraries
- Arrow styles (`-Stealth`, `-latex`) → `arrows.meta` library
- Circuit elements → `circuits` library
- Decorations → appropriate `decorations` libraries
- And many more...

This means you can often write TikZ code without explicitly declaring libraries, and the plugin will figure out what you need.

### Custom Preamble (For Advanced Cases)

For specialized packages or commands that aren't automatically detected, you can still use the custom preamble in plugin settings:

```
% Only needed for specialized packages not auto-detected
\usepackage{tikz-cd}
\usepackage{tikz-3dplot}
\usepackage{chemfig}
```

The plugin already handles these automatically:
- `\usepackage{tikz}`
- `\usepackage{pgfplots}` (when needed)
- `\pgfplotsset{compat=1.18}` (when needed)
- Common TikZ libraries

## Examples

### Basic Shapes

```tikz
\begin{tikzpicture}
  % Circle
  \draw[thick, red, fill=red!20] (0,0) circle (1cm);

  % Rectangle
  \draw[thick, blue, fill=blue!20] (3,0) rectangle (5,2);

  % Triangle
  \draw[thick, green, fill=green!20] (7,0) -- (8,2) -- (9,0) -- cycle;

  % Line with arrow
  \draw[->, thick] (1,0) -- (2,0);

  % Text
  \node at (0,0) {Circle};
  \node at (4,1) {Rectangle};
  \node at (8,0.5) {Triangle};
\end{tikzpicture}
```

### Function Plot

```tikz
\begin{tikzpicture}
\begin{axis}[
    title={Simple Functions},
    xlabel={$x$},
    ylabel={$y$},
    xmin=-2, xmax=2,
    ymin=-4, ymax=4,
    grid=both,
    legend pos=north west
]
\addplot[blue, domain=-2:2, samples=50] {x^2};
\addplot[red, domain=-2:2, samples=50] {x^3};
\legend{$x^2$, $x^3$}
\end{axis}
\end{tikzpicture}
```

### Bayesian Network

```tikz
\usetikzlibrary{bayesnet,positioning}
\begin{tikzpicture}
  % Define nodes
  \node[latent] (rain) at (0,0) {Rain};
  \node[latent] (sprinkler) at (2,0) {Sprinkler};
  \node[latent] (wet_roof) at (0,-1.5) {Wet Roof};
  \node[latent] (wet_grass) at (2,-1.5) {Wet Grass};
  \node[obs] (slippery) at (2,-3) {Slippery};

  % Define edges
  \edge {rain} {sprinkler};
  \edge {rain} {wet_roof};
  \edge {rain} {wet_grass};
  \edge {sprinkler} {wet_grass};
  \edge {wet_grass} {slippery};

  % Add probability annotations
  \node[above] at (rain) {$P(R)$};
  \node[above] at (sprinkler) {$P(S|R)$};
  \node[below] at (wet_roof) {$P(WR|R)$};
  \node[below] at (wet_grass) {$P(WG|R,S)$};
  \node[below] at (slippery) {$P(SL|WG)$};
\end{tikzpicture}
```

## Troubleshooting

If you encounter rendering errors, try the following:

1. **Include Required Libraries**: If you're using specialized TikZ features, explicitly include the required libraries with `\usetikzlibrary{...}` at the beginning of your code.

2. **Check Error Messages**: The plugin provides detailed error messages with suggestions for fixing issues. Look for:
   - Suggestions for required libraries
   - Syntax error locations
   - Missing package recommendations

3. **Check Syntax**: Ensure your TikZ code has correct syntax:
   - Matching braces and parentheses
   - Semicolons at the end of commands
   - Correct command names and parameters

4. **Simplify**: Try a simpler example first to isolate the issue.

5. **Look at Examples**: Check the [examples directory](../examples/categories/) for working examples similar to what you're trying to achieve.

## Smart Processing Features

The plugin includes several smart features to make your TikZ experience better:

1. **Automatic Document Structure**: Adds necessary document structure around your TikZ code
2. **Package Detection**: Automatically includes required packages based on your code
3. **Library Detection**: Intelligently detects and adds required TikZ libraries
4. **Error Suggestions**: Provides helpful suggestions when errors occur
5. **Syntax Flexibility**: Supports various ways of writing TikZ code

These features make your TikZ code more concise and easier to write, allowing you to focus on your diagrams rather than boilerplate code.
