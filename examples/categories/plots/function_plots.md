# Function Plots with PGFPlots

This file contains examples of function plots using PGFPlots.

## Simple Function Plot

```tikz
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\begin{tikzpicture}
\begin{axis}[
    title={Simple Function},
    xlabel={$x$},
    ylabel={$y$},
    xmin=-2, xmax=2,
    ymin=-4, ymax=4,
    legend pos=north west,
    grid=both
]
\addplot[blue, domain=-2:2, samples=100] {x^2};
\addplot[red, domain=-2:2, samples=100] {x^3};
\legend{$x^2$, $x^3$}
\end{axis}
\end{tikzpicture}
```

## Bar Chart

```tikz
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\begin{tikzpicture}
\begin{axis}[
    title={Bar Chart},
    xlabel={Category},
    ylabel={Value},
    symbolic x coords={A,B,C,D,E},
    xtick=data,
    ybar,
    bar width=0.5cm,
    ymin=0,
    enlarge x limits=0.2
]
\addplot coordinates {(A,5) (B,7) (C,9) (D,4) (E,6)};
\end{axis}
\end{tikzpicture}
```

## 3D Surface Plot

```tikz
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\begin{tikzpicture}
\begin{axis}[
    title={3D Surface},
    view={30}{30},
    colormap/cool
]
\addplot3[
    surf,
    domain=-2:2,
    domain y=-2:2,
    samples=20
] {sin(deg(x))*cos(deg(y))};
\end{axis}
\end{tikzpicture}
```
