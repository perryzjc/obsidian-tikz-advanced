# Bayesian Network Examples (Fixed)

This document contains examples of Bayesian networks using the tikz-bayesnet library.

## 1. Simple Bayesian Network

```tikz
\usepackage{tikz}
\usetikzlibrary{bayesnet}
\begin{tikzpicture}
  % Define nodes
  \node[latent] (rain) {Rain};
  \node[latent, right=of rain] (sprinkler) {Sprinkler};
  \node[latent, below=of rain] (wet_roof) {Wet Roof};
  \node[latent, below=of sprinkler] (wet_grass) {Wet Grass};
  \node[obs, below=of wet_grass] (slippery) {Slippery};
  
  % Define edges
  \edge {rain} {sprinkler};
  \edge {rain} {wet_roof};
  \edge {rain} {wet_grass};
  \edge {sprinkler} {wet_grass};
  \edge {wet_grass} {slippery};
  
  % Add a plate
  \plate {observations} {(wet_grass)(slippery)} {Observations};
  
  % Add probability annotations
  \node[above=0.1cm of rain] {$P(R)$};
  \node[above=0.1cm of sprinkler] {$P(S|R)$};
  \node[below=0.1cm of wet_roof] {$P(WR|R)$};
  \node[below=0.1cm of wet_grass] {$P(WG|R,S)$};
  \node[below=0.1cm of slippery] {$P(SL|WG)$};
\end{tikzpicture}
```

## 2. Alternative Bayesian Network (Without tikz-bayesnet)

```tikz
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,shapes.geometric,fit}
\begin{tikzpicture}[
  node distance=1.5cm,
  every node/.style={fill=white, font=\sffamily},
  latent/.style={circle, draw, minimum size=1cm},
  observed/.style={circle, draw, double, minimum size=1cm},
  plate/.style={rectangle, draw, inner sep=0.5cm, rounded corners}
]

  % Define nodes
  \node[latent] (rain) {Rain};
  \node[latent, right=of rain] (sprinkler) {Sprinkler};
  \node[latent, below=of rain] (wet_roof) {Wet Roof};
  \node[latent, below=of sprinkler] (wet_grass) {Wet Grass};
  \node[observed, below=of wet_grass] (slippery) {Slippery};
  
  % Define edges
  \draw[-Stealth] (rain) -- (sprinkler);
  \draw[-Stealth] (rain) -- (wet_roof);
  \draw[-Stealth] (rain) -- (wet_grass);
  \draw[-Stealth] (sprinkler) -- (wet_grass);
  \draw[-Stealth] (wet_grass) -- (slippery);
  
  % Add a plate
  \node[plate, fit=(wet_grass) (slippery), label=below right:Observations] (plate) {};
  
  % Add probability annotations
  \node[above=0.1cm of rain, font=\small] {$P(R)$};
  \node[above=0.1cm of sprinkler, font=\small] {$P(S|R)$};
  \node[below=0.1cm of wet_roof, font=\small] {$P(WR|R)$};
  \node[below=0.1cm of wet_grass, font=\small] {$P(WG|R,S)$};
  \node[below=0.1cm of slippery, font=\small] {$P(SL|WG)$};
\end{tikzpicture}
```

## 3. Naive Bayes Classifier

```tikz
\usepackage{tikz}
\usetikzlibrary{bayesnet}
\begin{tikzpicture}
  % Class node
  \node[latent] (class) {Class};
  
  % Feature nodes
  \node[obs, below left=1cm and 1.5cm of class] (f1) {Feature 1};
  \node[obs, below=1.5cm of class] (f2) {Feature 2};
  \node[obs, below right=1cm and 1.5cm of class] (f3) {Feature 3};
  
  % Edges
  \edge {class} {f1};
  \edge {class} {f2};
  \edge {class} {f3};
  
  % Plate
  \plate {features} {(f1)(f2)(f3)} {Features};
  
  % Probability annotations
  \node[above=0.1cm of class] {$P(C)$};
  \node[below=0.1cm of f1] {$P(F_1|C)$};
  \node[below=0.1cm of f2] {$P(F_2|C)$};
  \node[below=0.1cm of f3] {$P(F_3|C)$};
\end{tikzpicture}
```

## 4. Hidden Markov Model

```tikz
\usepackage{tikz}
\usetikzlibrary{bayesnet}
\begin{tikzpicture}
  % Hidden states
  \node[latent] (s1) {$S_1$};
  \node[latent, right=of s1] (s2) {$S_2$};
  \node[latent, right=of s2] (s3) {$S_3$};
  \node[latent, right=of s3] (s4) {$S_4$};
  
  % Observations
  \node[obs, below=of s1] (o1) {$O_1$};
  \node[obs, below=of s2] (o2) {$O_2$};
  \node[obs, below=of s3] (o3) {$O_3$};
  \node[obs, below=of s4] (o4) {$O_4$};
  
  % Edges between hidden states
  \edge {s1} {s2};
  \edge {s2} {s3};
  \edge {s3} {s4};
  
  % Edges from hidden states to observations
  \edge {s1} {o1};
  \edge {s2} {o2};
  \edge {s3} {o3};
  \edge {s4} {o4};
  
  % Plate
  \plate {model} {(s1)(s2)(s3)(s4)(o1)(o2)(o3)(o4)} {Markov Model};
\end{tikzpicture}
```

## 5. Alternative Hidden Markov Model (Without tikz-bayesnet)

```tikz
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,shapes.geometric,fit}
\begin{tikzpicture}[
  node distance=1.5cm,
  every node/.style={fill=white, font=\sffamily},
  latent/.style={circle, draw, minimum size=1cm},
  observed/.style={circle, draw, double, minimum size=1cm},
  plate/.style={rectangle, draw, inner sep=0.5cm, rounded corners}
]
  % Hidden states
  \node[latent] (s1) {$S_1$};
  \node[latent, right=of s1] (s2) {$S_2$};
  \node[latent, right=of s2] (s3) {$S_3$};
  \node[latent, right=of s3] (s4) {$S_4$};
  
  % Observations
  \node[observed, below=of s1] (o1) {$O_1$};
  \node[observed, below=of s2] (o2) {$O_2$};
  \node[observed, below=of s3] (o3) {$O_3$};
  \node[observed, below=of s4] (o4) {$O_4$};
  
  % Edges between hidden states
  \draw[-Stealth] (s1) -- (s2);
  \draw[-Stealth] (s2) -- (s3);
  \draw[-Stealth] (s3) -- (s4);
  
  % Edges from hidden states to observations
  \draw[-Stealth] (s1) -- (o1);
  \draw[-Stealth] (s2) -- (o2);
  \draw[-Stealth] (s3) -- (o3);
  \draw[-Stealth] (s4) -- (o4);
  
  % Plate
  \node[plate, fit=(s1) (s2) (s3) (s4) (o1) (o2) (o3) (o4), label=below right:Markov Model] (plate) {};
\end{tikzpicture}
```
