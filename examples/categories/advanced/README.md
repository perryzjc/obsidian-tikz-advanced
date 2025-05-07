# Advanced TikZ Examples

This directory contains advanced TikZ examples with custom styles and complex diagrams. These examples demonstrate sophisticated TikZ features and techniques for creating complex visualizations.

## Examples

### [Custom Styles](custom_styles.md)
Advanced diagrams with custom styles including neural networks, finite state machines, and flowcharts

<img src="../../../docs/images/examples/advanced/neural_network.svg" width="200" height="150" alt="Neural Network Example">

## Key Concepts

- **Custom Styles**: Defining reusable styles for diagram elements
- **Complex Layouts**: Creating sophisticated layouts with multiple elements
- **Programmatic Drawing**: Using loops and conditionals for repetitive elements
- **Advanced Libraries**: Utilizing specialized TikZ libraries for specific diagram types
- **Nested Structures**: Creating hierarchical and nested diagram elements

## Getting Started

To create advanced diagrams, define custom styles and use TikZ's programming features:

```tikz
\usetikzlibrary{arrows.meta,positioning}
\begin{tikzpicture}[
  % Define custom styles
  neuron/.style={circle, draw, minimum size=0.5cm},
  input/.style={neuron, fill=green!20},
  hidden/.style={neuron, fill=blue!20},
  output/.style={neuron, fill=red!20},
  arrow/.style={-Stealth, thick}
]
  % Create nodes programmatically
  \foreach \i in {1,2,3} {
    \node[input] (i\i) at (0,-\i+1) {};
  }

  \foreach \i in {1,2} {
    \node[hidden] (h\i) at (2,-\i*0.5) {};
  }

  \node[output] (o1) at (4,-0.5) {};

  % Connect nodes programmatically
  \foreach \i in {1,2,3}
    \foreach \j in {1,2}
      \draw[arrow] (i\i) -- (h\j);

  \foreach \i in {1,2}
    \draw[arrow] (h\i) -- (o1);
\end{tikzpicture}
```
