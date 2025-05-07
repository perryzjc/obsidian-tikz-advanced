# Advanced TikZ Examples with Custom Styles

This file contains examples of advanced TikZ diagrams with custom styles.

## Neural Network

```tikz
\usetikzlibrary{arrows.meta,positioning}
\begin{tikzpicture}[
    neuron/.style={circle, draw, minimum size=0.5cm},
    input/.style={neuron, fill=green!20},
    hidden/.style={neuron, fill=blue!20},
    output/.style={neuron, fill=red!20},
    arrow/.style={-Stealth, thick}
]
    % Input layer
    \node[input] (i1) at (0,0) {};
    \node[input] (i2) at (0,-1) {};
    \node[input] (i3) at (0,-2) {};
    
    % Hidden layer
    \node[hidden] (h1) at (2,0) {};
    \node[hidden] (h2) at (2,-1) {};
    \node[hidden] (h3) at (2,-2) {};
    
    % Output layer
    \node[output] (o1) at (4,-0.5) {};
    \node[output] (o2) at (4,-1.5) {};
    
    % Connections
    \foreach \i in {1,2,3}
        \foreach \j in {1,2,3}
            \draw[arrow] (i\i) -- (h\j);
            
    \foreach \i in {1,2,3}
        \foreach \j in {1,2}
            \draw[arrow] (h\i) -- (o\j);
\end{tikzpicture}
```

## Finite State Machine

```tikz
\usetikzlibrary{arrows.meta,automata,positioning}
\begin{tikzpicture}[
    > = Stealth,
    shorten > = 1pt,
    auto,
    node distance = 2cm
]
    \node[state, initial] (q0) {$q_0$};
    \node[state] (q1) [right of=q0] {$q_1$};
    \node[state, accepting] (q2) [right of=q1] {$q_2$};
    
    \path[->] 
        (q0) edge node {a} (q1)
        (q1) edge node {b} (q2)
        (q2) edge [loop above] node {a,b} (q2)
        (q0) edge [loop above] node {b} (q0)
        (q1) edge [bend right] node [below] {a} (q0);
\end{tikzpicture}
```

## Flowchart

```tikz
\usetikzlibrary{arrows.meta,shapes.geometric,positioning}
\begin{tikzpicture}[
    start/.style={rectangle, rounded corners, draw=black, fill=green!20, minimum width=2cm, minimum height=1cm},
    process/.style={rectangle, draw=black, fill=blue!20, minimum width=2cm, minimum height=1cm},
    decision/.style={diamond, draw=black, fill=yellow!20, minimum width=2cm, minimum height=1cm},
    end/.style={rectangle, rounded corners, draw=black, fill=red!20, minimum width=2cm, minimum height=1cm},
    arrow/.style={thick,-Stealth},
    node distance=1.5cm
]
    \node (start) [start] {Start};
    \node (proc1) [process, below of=start] {Process 1};
    \node (dec) [decision, below of=proc1] {Decision?};
    \node (proc2a) [process, below left of=dec, xshift=-1cm] {Process 2A};
    \node (proc2b) [process, below right of=dec, xshift=1cm] {Process 2B};
    \node (end) [end, below of=dec, yshift=-2cm] {End};
    
    \draw [arrow] (start) -- (proc1);
    \draw [arrow] (proc1) -- (dec);
    \draw [arrow] (dec) -- node[left] {Yes} (proc2a);
    \draw [arrow] (dec) -- node[right] {No} (proc2b);
    \draw [arrow] (proc2a) |- (end);
    \draw [arrow] (proc2b) |- (end);
\end{tikzpicture}
```
