# Bayes Network Example

This example demonstrates a Bayesian network using the tikz-bayesnet library.

```tikz
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

## Alternative Version (Without tikz-bayesnet)

If your server doesn't have the tikz-bayesnet library, you can use this alternative version:

```tikz
\usetikzlibrary{arrows.meta,positioning,shapes.geometric}
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
