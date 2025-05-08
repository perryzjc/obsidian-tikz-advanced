import { MarkdownPostProcessorContext, Notice } from 'obsidian';
import TikZAdvancedPlugin from '../main';
import { TikZRenderResult } from '../shared/types';

export class TikZRenderer {
  private plugin: TikZAdvancedPlugin;

  constructor(plugin: TikZAdvancedPlugin) {
    this.plugin = plugin;
  }

  async render(source: string, containerEl: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
    // Create container for the TikZ diagram
    const tikzContainer = containerEl.createDiv({ cls: 'tikz-container' });

    // Create toolbar
    const toolbar = tikzContainer.createDiv({ cls: 'tikz-toolbar' });

    // Create format selector
    const formatSelector = toolbar.createDiv({ cls: 'format-selector' });
    formatSelector.createSpan({ text: 'Format: ' });

    const svgButton = formatSelector.createEl('button', { text: 'SVG' });
    const pdfButton = formatSelector.createEl('button', { text: 'PDF' });

    // Set active button based on default format
    if (this.plugin.settings.defaultOutputFormat === 'svg') {
      svgButton.addClass('active');
    } else {
      pdfButton.addClass('active');
    }

    // Create spacer
    toolbar.createDiv({ cls: 'spacer' });

    // Create zoom controls if enabled
    if (this.plugin.settings.enableZoom) {
      const zoomOutButton = toolbar.createEl('button', { text: '🔍-' });
      const zoomResetButton = toolbar.createEl('button', { text: '100%' });
      const zoomInButton = toolbar.createEl('button', { text: '🔍+' });

      // Zoom functionality will be implemented later
    }

    // Create refresh button
    const refreshButton = toolbar.createEl('button', { text: '🔄' });

    // Create content area
    const contentEl = tikzContainer.createDiv({ cls: 'tikz-content' });
    if (this.plugin.settings.enableZoom) {
      contentEl.addClass('zoom-enabled');
    }

    // Create loading indicator
    const loadingEl = contentEl.createDiv({ cls: 'tikz-loading' });
    loadingEl.createDiv({ cls: 'tikz-loading-spinner' });

    // Create error container (hidden by default)
    const errorEl = tikzContainer.createDiv({ cls: 'tikz-error tikz-hidden' });

    // Create cache indicator if enabled
    let cacheIndicator: HTMLElement | null = null;
    if (this.plugin.settings.showCacheIndicator) {
      cacheIndicator = toolbar.createSpan({ cls: 'tikz-cache-indicator' });
    }

    // Try to get from cache first
    let renderResult: TikZRenderResult | null = null;
    let fromCache = false;

    if (this.plugin.settings.cacheEnabled) {
      renderResult = this.plugin.cache.get(source, this.plugin.settings.defaultOutputFormat);
      if (renderResult) {
        fromCache = true;
      }
    }

    // If not in cache, render it
    if (!renderResult) {
      try {
        renderResult = await this.plugin.serverConnector.renderTikZ(
          source,
          this.plugin.settings.defaultOutputFormat,
          this.plugin.settings.preferredEngine
        );

        // Cache the result if caching is enabled
        if (this.plugin.settings.cacheEnabled && renderResult) {
          this.plugin.cache.set(source, renderResult);
        }
      } catch (error: any) {
        // Handle error
        loadingEl.remove();
        errorEl.removeClass('tikz-hidden');
        errorEl.addClass('tikz-visible');

        // Clear the error element
        errorEl.empty();

        // Check if the error has structured error information
        if (error.errorInfo || error.errorHTML) {
          this.createStructuredErrorDisplay(errorEl, error);
        } else {
          // Simple error message
          errorEl.setText(`Error rendering TikZ: ${error.message}`);
        }

        console.error('TikZ rendering error:', error);
        return;
      }
    }

    // Remove loading indicator
    loadingEl.remove();

    // Update cache indicator if enabled
    if (cacheIndicator && fromCache) {
      cacheIndicator.setText('(cached)');
    }

    // Display the rendered content
    if (renderResult) {
      if (renderResult.format === 'svg') {
        // For SVG, create a container and set its content safely
        const svgContainer = contentEl.createDiv();

        // Create a temporary DOM element to parse the SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(renderResult.content, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Append the SVG element to our container
        svgContainer.appendChild(document.importNode(svgElement, true));
      } else if (renderResult.format === 'pdf') {
        // For PDF, we need to create an object or embed element
        const pdfEmbed = contentEl.createEl('embed', {
          attr: {
            type: 'application/pdf',
            src: `data:application/pdf;base64,${renderResult.content}`,
            cls: 'tikz-pdf-embed'
          }
        });
      }
    }

    // Set up event handlers for toolbar buttons
    svgButton.addEventListener('click', async () => {
      svgButton.addClass('active');
      pdfButton.removeClass('active');
      await this.updateFormat(source, contentEl, errorEl, cacheIndicator, 'svg');
    });

    pdfButton.addEventListener('click', async () => {
      pdfButton.addClass('active');
      svgButton.removeClass('active');
      await this.updateFormat(source, contentEl, errorEl, cacheIndicator, 'pdf');
    });

    refreshButton.addEventListener('click', async () => {
      await this.refreshRender(source, contentEl, errorEl, cacheIndicator);
    });

    // Set up zoom functionality if enabled
    if (this.plugin.settings.enableZoom) {
      let zoomLevel = 1;
      contentEl.addClass('tikz-content-zoom-1');

      contentEl.addEventListener('click', () => {
        if (zoomLevel === 1) {
          zoomLevel = 2;
          contentEl.removeClass('tikz-content-zoom-1');
          contentEl.addClass('tikz-content-zoom-2');
          contentEl.addClass('zoomed');
        } else {
          zoomLevel = 1;
          contentEl.removeClass('tikz-content-zoom-2');
          contentEl.addClass('tikz-content-zoom-1');
          contentEl.removeClass('zoomed');
        }
      });
    }
  }

  private async updateFormat(
    source: string,
    contentEl: HTMLElement,
    errorEl: HTMLElement,
    cacheIndicator: HTMLElement | null,
    format: 'svg' | 'pdf'
  ): Promise<void> {
    // Clear content and show loading
    contentEl.empty();
    const loadingEl = contentEl.createDiv({ cls: 'tikz-loading' });
    loadingEl.createDiv({ cls: 'tikz-loading-spinner' });

    errorEl.addClass('tikz-hidden');
    errorEl.removeClass('tikz-visible');

    // Update cache indicator
    if (cacheIndicator) {
      cacheIndicator.setText('');
    }

    // Try to get from cache first
    let renderResult: TikZRenderResult | null = null;
    let fromCache = false;

    if (this.plugin.settings.cacheEnabled) {
      renderResult = this.plugin.cache.get(source, format);
      if (renderResult) {
        fromCache = true;
      }
    }

    // If not in cache, render it
    if (!renderResult) {
      try {
        renderResult = await this.plugin.serverConnector.renderTikZ(
          source,
          format,
          this.plugin.settings.preferredEngine
        );

        // Cache the result if caching is enabled
        if (this.plugin.settings.cacheEnabled && renderResult) {
          this.plugin.cache.set(source, renderResult);
        }
      } catch (error: any) {
        // Handle error
        loadingEl.remove();
        errorEl.removeClass('tikz-hidden');
        errorEl.addClass('tikz-visible');

        // Log the error for debugging
        if (this.plugin.settings.debugMode) {
          console.log('TikZ error object:', error);
          console.log('Error message:', error.message);
          console.log('Has errorHTML:', !!error.errorHTML);
          console.log('Has errorInfo:', !!error.errorInfo);
        }

        // Clear the error element
        errorEl.empty();

        // Check if the error has structured error information
        if (error.errorInfo || error.errorHTML) {
          this.createStructuredErrorDisplay(errorEl, error);
        } else {
          // Create a basic error container with improved styling
          const errorContainer = errorEl.createDiv({ cls: 'tikz-error-container' });

          // Create error header
          const errorHeader = errorContainer.createDiv({ cls: 'tikz-error-header error' });

          // Add error icon
          const errorIcon = errorHeader.createSpan({ cls: 'tikz-error-icon' });

          // Add error title
          const errorTitle = errorHeader.createSpan({
            cls: 'tikz-error-title',
            text: 'TikZ Error'
          });

          // Create error message - always highlight to make it stand out
          const errorMessage = errorContainer.createDiv({
            cls: 'tikz-error-message specific-error',
            text: error.message || 'Unknown error'
          });

          // Add a note about checking server logs
          const noteEl = errorContainer.createDiv({
            cls: 'tikz-error-note',
            text: 'For more details, check the server logs or try running the TikZ code in a LaTeX editor.'
          });
        }

        // Log the error for debugging
        console.error('TikZ rendering error:', error);
        return;
      }
    }

    // Remove loading indicator
    loadingEl.remove();

    // Update cache indicator if enabled
    if (cacheIndicator && fromCache) {
      cacheIndicator.setText('(cached)');
    }

    // Display the rendered content
    if (renderResult) {
      if (renderResult.format === 'svg') {
        // For SVG, create a container and set its content safely
        const svgContainer = contentEl.createDiv();

        // Create a temporary DOM element to parse the SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(renderResult.content, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Append the SVG element to our container
        svgContainer.appendChild(document.importNode(svgElement, true));
      } else if (renderResult.format === 'pdf') {
        // For PDF, we need to create an object or embed element
        const pdfEmbed = contentEl.createEl('embed', {
          attr: {
            type: 'application/pdf',
            src: `data:application/pdf;base64,${renderResult.content}`,
            cls: 'tikz-pdf-embed'
          }
        });
      }
    }
  }

  private async refreshRender(
    source: string,
    contentEl: HTMLElement,
    errorEl: HTMLElement,
    cacheIndicator: HTMLElement | null
  ): Promise<void> {
    // Clear content and show loading
    contentEl.empty();
    const loadingEl = contentEl.createDiv({ cls: 'tikz-loading' });
    loadingEl.createDiv({ cls: 'tikz-loading-spinner' });

    errorEl.addClass('tikz-hidden');
    errorEl.removeClass('tikz-visible');

    // Update cache indicator
    if (cacheIndicator) {
      cacheIndicator.setText('');
    }

    // Clear the cache for this source to ensure we get a fresh render
    if (this.plugin.settings.cacheEnabled) {
      this.plugin.cache.clear();
      console.log('Cache cleared for refresh');
    }

    // Force a new render (bypass cache)
    try {
      const renderResult = await this.plugin.serverConnector.renderTikZ(
        source,
        this.plugin.settings.defaultOutputFormat,
        this.plugin.settings.preferredEngine
      );

      // Cache the result if caching is enabled
      if (this.plugin.settings.cacheEnabled && renderResult) {
        this.plugin.cache.set(source, renderResult);
      }

      // Remove loading indicator
      loadingEl.remove();

      // Display the rendered content
      if (renderResult) {
        if (renderResult.format === 'svg') {
          // For SVG, create a container and set its content safely
          const svgContainer = contentEl.createDiv();

          // Create a temporary DOM element to parse the SVG
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(renderResult.content, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;

          // Append the SVG element to our container
          svgContainer.appendChild(document.importNode(svgElement, true));
        } else if (renderResult.format === 'pdf') {
          // For PDF, we need to create an object or embed element
          const pdfEmbed = contentEl.createEl('embed', {
            attr: {
              type: 'application/pdf',
              src: `data:application/pdf;base64,${renderResult.content}`,
              cls: 'tikz-pdf-embed'
            }
          });
        }
      }
    } catch (error: any) {
      // Handle error
      loadingEl.remove();
      errorEl.removeClass('tikz-hidden');
      errorEl.addClass('tikz-visible');

      // Log the error for debugging
      if (this.plugin.settings.debugMode) {
        console.log('TikZ refresh error object:', error);
        console.log('Error message:', error.message);
        console.log('Has errorHTML:', !!error.errorHTML);
        console.log('Has errorInfo:', !!error.errorInfo);
      }

      // Clear the error element
      errorEl.empty();

      // Check if the error has structured error information
      if (error.errorInfo || error.errorHTML) {
        this.createStructuredErrorDisplay(errorEl, error);
      } else {
        // Create a basic error container with improved styling
        const errorContainer = errorEl.createDiv({ cls: 'tikz-error-container' });

        // Create error header
        const errorHeader = errorContainer.createDiv({ cls: 'tikz-error-header error' });

        // Add error icon
        const errorIcon = errorHeader.createSpan({ cls: 'tikz-error-icon' });

        // Add error title
        const errorTitle = errorHeader.createSpan({
          cls: 'tikz-error-title',
          text: 'TikZ Error'
        });

        // Create error message - always highlight to make it stand out
        const errorMessage = errorContainer.createDiv({
          cls: 'tikz-error-message specific-error',
          text: error.message || 'Unknown error'
        });

        // Add a note about checking server logs
        const noteEl = errorContainer.createDiv({
          cls: 'tikz-error-note',
          text: 'For more details, check the server logs or try running the TikZ code in a LaTeX editor.'
        });
      }

      // Log the error for debugging
      console.error('TikZ refresh error:', error);
    }
  }

  /**
   * Create a structured error display
   */
  private createStructuredErrorDisplay(containerEl: HTMLElement, error: any): void {
    if (this.plugin.settings.debugMode) {
      console.log('Creating structured error display with:', error);
    }

    // Clear the container
    containerEl.empty();

    try {
      // If the error has HTML content, parse it and create DOM elements
      if (error.errorHTML) {
        // Create a wrapper div to hold the content
        const wrapper = containerEl.createDiv({ cls: 'tikz-error-wrapper' });

        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(error.errorHTML, 'text/html');

        // Import and append the body content
        const bodyContent = doc.body;
        if (bodyContent) {
          Array.from(bodyContent.childNodes).forEach(node => {
            wrapper.appendChild(document.importNode(node, true));
          });
        }

        // Add click handler to toggle details visibility
        setTimeout(() => {
          const errorHeader = wrapper.querySelector('.tikz-error-header');
          const detailsSection = wrapper.querySelector('.tikz-error-details');
          const toggleButton = wrapper.querySelector('.tikz-error-toggle');

          if (errorHeader && detailsSection) {
            // Initially hide details
            detailsSection.addClass('tikz-hidden');
            detailsSection.removeClass('tikz-visible');

            errorHeader.addEventListener('click', () => {
              if (detailsSection.hasClass('tikz-hidden')) {
                detailsSection.removeClass('tikz-hidden');
                detailsSection.addClass('tikz-visible');
                if (toggleButton) toggleButton.textContent = '▲';
              } else {
                detailsSection.addClass('tikz-hidden');
                detailsSection.removeClass('tikz-visible');
                if (toggleButton) toggleButton.textContent = '▼';
              }
            });
          }
        }, 0);

        return;
      }

      // Extract error info
      const errorInfo = error.errorInfo || {
        message: error.message || 'Unknown error',
        severity: 'error',
        context: error.context || '',
        suggestion: ''
      };

      // Create the error container
      const errorContainer = containerEl.createDiv({ cls: 'tikz-error-container' });

      // Create a simplified error header
      const errorHeader = errorContainer.createDiv({ cls: 'tikz-error-header' });
      errorHeader.createSpan({ cls: 'tikz-error-icon' });
      errorHeader.createSpan({ cls: 'tikz-error-title', text: 'TikZ Error' });

      // Add toggle button for expanding/collapsing details
      const toggleButton = errorHeader.createSpan({ cls: 'tikz-error-toggle', text: '▼' });

      // Create the main error message section
      // Always use specific-error class to make the original LaTeX error message stand out
      const messageContainer = errorContainer.createDiv({
        cls: 'tikz-error-message specific-error'
      });
      // Use the original error message from the server
      messageContainer.setText(error.message || errorInfo.message || 'Unknown error');

      // Create collapsible details section
      const detailsContainer = errorContainer.createDiv({ cls: 'tikz-error-details tikz-hidden' });

      // Add toggle functionality
      errorHeader.addEventListener('click', () => {
        if (detailsContainer.hasClass('tikz-hidden')) {
          detailsContainer.removeClass('tikz-hidden');
          detailsContainer.addClass('tikz-visible');
          toggleButton.setText('▲');
        } else {
          detailsContainer.addClass('tikz-hidden');
          detailsContainer.removeClass('tikz-visible');
          toggleButton.setText('▼');
        }
      });

      // Add line number if available
      if (errorInfo.line) {
        detailsContainer.createDiv({
          cls: 'tikz-error-line',
          text: `Line: ${errorInfo.line}`
        });
      }

      // Add suggestion if available
      if (errorInfo.suggestion) {
        const suggestionEl = detailsContainer.createDiv({ cls: 'tikz-error-suggestion' });
        suggestionEl.createEl('strong', { text: 'Suggestion: ' });
        suggestionEl.createSpan({ text: errorInfo.suggestion });
      }

      // Add problematic code if available
      if (errorInfo.code) {
        const codeEl = detailsContainer.createDiv({ cls: 'tikz-error-code' });
        codeEl.createEl('strong', { text: 'Problematic code: ' });
        const codeSpan = codeEl.createSpan();
        codeSpan.createEl('code', { text: errorInfo.code });
      }

      // Add context if available
      if (errorInfo.context) {
        const contextEl = detailsContainer.createDiv({ cls: 'tikz-error-context' });
        contextEl.createEl('strong', { text: 'Context: ' });
        contextEl.createEl('pre', { text: errorInfo.context });
      }

      // Add a note about checking server logs
      const noteEl = errorContainer.createDiv({ cls: 'tikz-error-note' });
      noteEl.setText('For more details, check the server logs or try running the TikZ code in a LaTeX editor.');

      // Add a "Get Help" button for common errors
      if (errorInfo.errorType) {
        const fixButtonContainer = detailsContainer.createDiv({ cls: 'tikz-error-fix' });
        const fixButton = fixButtonContainer.createEl('button', {
          cls: 'tikz-fix-button',
          text: 'Get Help'
        });

        fixButton.addEventListener('click', () => {
          // Open documentation or help resources based on error type
          let helpUrl = 'https://tikz.dev/';

          // Add specific help URLs based on error type
          if (errorInfo.errorType === 'UndefinedControlSequence') {
            helpUrl = 'https://tikz.dev/errors#undefined-control-sequence';
          } else if (errorInfo.errorType === 'MissingPackage') {
            helpUrl = 'https://tikz.dev/errors#missing-package';
          } else if (errorInfo.errorType === 'PreambleOnlyCommand') {
            helpUrl = 'https://tikz.dev/errors#preamble-only-command';
          } else if (errorInfo.errorType === 'MathModeError') {
            helpUrl = 'https://tikz.dev/errors#math-mode-error';
          }

          // Open the URL in a new window
          window.open(helpUrl);
        });
      }
    } catch (err) {
      // Fallback if something goes wrong with the structured display
      console.error('Error creating structured error display:', err);
      containerEl.setText(`Error rendering TikZ: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Clean up resources used by the renderer
   */
  public cleanup(): void {
    // No active resources to clean up at the moment
    // This method can be extended if needed in the future
  }
}
