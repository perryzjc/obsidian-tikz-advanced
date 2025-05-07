# TikZ Advanced Shared Code

This directory contains code that is shared between the client and server components of the TikZ Advanced plugin.

## Contents

- **types.ts**: Type definitions for the client-server communication
- **logger.ts**: Logging utility

## Types

The shared types include:

- **TikZRenderRequest**: Request to render a TikZ diagram
- **TikZRenderResult**: Result of rendering a TikZ diagram
- **HealthResponse**: Response from the server health check endpoint

These types ensure that the client and server communicate correctly.
