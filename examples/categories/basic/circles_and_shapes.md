# Basic TikZ Shapes

This file contains examples of basic TikZ shapes and drawing commands.

## Simple Circle

```tikz
\begin{tikzpicture}
  \draw (0,0) circle (1cm);
\end{tikzpicture}
```

## Colored Circle with Text

```tikz
\begin{tikzpicture}
  \draw[thick, red, fill=red!20] (0,0) circle (1cm);
  \node at (0,0) {Circle};
\end{tikzpicture}
```

## Rectangle

```tikz
\begin{tikzpicture}
  \draw[thick, blue, fill=blue!10] (0,0) rectangle (2,1);
  \node at (1,0.5) {Rectangle};
\end{tikzpicture}
```

## Triangle

```tikz
\begin{tikzpicture}
  \draw[thick, green, fill=green!10] (0,0) -- (1,1.5) -- (2,0) -- cycle;
  \node at (1,0.5) {Triangle};
\end{tikzpicture}
```

## Grid with Circle

```tikz
\begin{tikzpicture}[scale=1.5]
  \draw[step=.5cm, gray, very thin] (-1.2,-1.2) grid (1.2,1.2);
  \draw[thick] (0,0) circle (1cm);
\end{tikzpicture}
```
