# Bayesian Network Examples

This directory contains examples of Bayesian networks using the tikz-bayesnet library. These examples demonstrate how to create probabilistic graphical models for representing statistical dependencies.

## Examples

### [Simple Bayes Network](simple_bayes_network.md)
Basic Bayesian network examples with latent and observed variables

<img src="../../../docs/images/examples/bayesian/bayes_network.svg" width="200" height="150" alt="Simple Bayesian Network Example">

### [Advanced Bayes Networks](advanced_bayes_networks.md)
More complex Bayesian network examples including Naive Bayes classifiers and Hidden Markov Models

<img src="../../../docs/images/examples/bayesian/bayes_network.svg" width="200" height="150" alt="Advanced Bayesian Network Example">

## Key Concepts

- **Node Types**:
  - `latent`: Unobserved/hidden variables (drawn as circles)
  - `obs`: Observed variables (drawn as double circles)
- **Edges**: Connections between nodes representing dependencies
- **Plates**: Rectangular regions indicating repeated structures
- **Probability Annotations**: Labels showing conditional probabilities

## Getting Started

To use the bayesnet library, include it at the beginning of your TikZ code:

```tikz
\usetikzlibrary{bayesnet,positioning}
\begin{tikzpicture}
  % Create nodes
  \node[latent] (A) {A};
  \node[obs, right=of A] (B) {B};

  % Create edges
  \edge {A} {B};

  % Add a plate (optional)
  \plate {plate} {(A)(B)} {Data};
\end{tikzpicture}
```
