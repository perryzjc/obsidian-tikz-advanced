# Basic TikZ Examples

This directory contains examples of basic TikZ shapes and drawing commands. These examples demonstrate the fundamental TikZ commands and are a good starting point for beginners.

## Examples

### [Circles and Shapes](circles_and_shapes.md)
Basic geometric shapes including circles, rectangles, and triangles

<img src="../../../docs/images/examples/basic/circle.svg" width="150" height="150" alt="Basic Circle Example">

## Key Concepts

- **Drawing commands**: `\draw` is the basic command for creating shapes and lines
- **Coordinates**: Points are specified using coordinates like `(0,0)` or `(1,2)`
- **Styles**: Shapes can be styled with attributes like `thick`, `red`, `fill=blue!20`
- **Paths**: Connect points with `--` to create lines and paths

## Getting Started

Basic TikZ syntax follows this pattern:

```tikz
\begin{tikzpicture}
  \draw[options] (coordinates) shape-or-path-commands;
\end{tikzpicture}
```

For example, to draw a red circle:

```tikz
\begin{tikzpicture}
  \draw[red, thick] (0,0) circle (1cm);
\end{tikzpicture}
```
