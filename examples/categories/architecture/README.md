# System Architecture Examples

This directory contains examples of system architecture diagrams. These examples demonstrate how to create clear and professional system architecture diagrams using TikZ.

## Examples

### [Simple Architecture](simple_architecture.md)
Basic system architecture diagrams with servers, databases, and clients

<img src="../../../docs/images/examples/architecture/system_architecture.svg" width="200" height="100" alt="Simple Architecture Example">

### [Advanced Architecture](advanced_architecture.md)
More complex system architecture diagrams with multiple components and layers

<img src="../../../docs/images/examples/architecture/system_architecture.svg" width="200" height="100" alt="Advanced Architecture Example">

## Key Concepts

- **Component Styles**: Custom styles for different system components (servers, databases, clients)
- **Connections**: Arrows and lines showing data flow and relationships
- **Layers**: Organizing components into logical layers
- **Labels**: Clear labeling of components and connections
- **Colors**: Using colors to distinguish different types of components

## Getting Started

To create system architecture diagrams, define custom styles for your components:

```tikz
\usetikzlibrary{arrows.meta,shapes.geometric,positioning}
\begin{tikzpicture}[
  % Define component styles
  server/.style={rectangle, rounded corners, draw, fill=blue!20, minimum width=2cm},
  database/.style={cylinder, draw, shape border rotate=90, aspect=0.3, fill=green!20},
  client/.style={rectangle, rounded corners, draw, fill=yellow!20},
  arrow/.style={-Stealth, thick}
]
  % Create components
  \node[server] (server) at (0,0) {Server};
  \node[database, right=of server] (db) {Database};
  \node[client, below=of server] (client) {Client};

  % Create connections
  \draw[arrow] (client) -- (server);
  \draw[arrow] (server) -- (db);
\end{tikzpicture}
```
