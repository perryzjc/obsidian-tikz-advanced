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
    const errorEl = tikzContainer.createDiv({ cls: 'tikz-error' });
    errorEl.style.display = 'none';

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
        errorEl.style.display = 'block';

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
        // For SVG, we can directly insert the content
        contentEl.innerHTML = renderResult.content;
      } else if (renderResult.format === 'pdf') {
        // For PDF, we need to create an object or embed element
        const pdfEmbed = contentEl.createEl('embed', {
          attr: {
            type: 'application/pdf',
            src: `data:application/pdf;base64,${renderResult.content}`,
            width: '100%',
            height: '400px'
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

      contentEl.addEventListener('click', () => {
        if (zoomLevel === 1) {
          zoomLevel = 2;
          contentEl.style.transform = `scale(${zoomLevel})`;
          contentEl.addClass('zoomed');
        } else {
          zoomLevel = 1;
          contentEl.style.transform = '';
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

    errorEl.style.display = 'none';

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
        errorEl.style.display = 'block';

        // Log the error for debugging
        console.log('TikZ error object:', error);
        console.log('Error message:', error.message);
        console.log('Has errorHTML:', !!error.errorHTML);
        console.log('Has errorInfo:', !!error.errorInfo);

        // Clear the error element
        errorEl.empty();

        // Check if the error has structured error information
        if (error.errorInfo || error.errorHTML) {
          this.createStructuredErrorDisplay(errorEl, error);
        } else {
          // Create a basic error container with improved styling
          const errorContainer = document.createElement('div');
          errorContainer.className = 'tikz-error-container';

          // Create error header
          const errorHeader = document.createElement('div');
          errorHeader.className = 'tikz-error-header error';

          // Add error icon
          const errorIcon = document.createElement('span');
          errorIcon.className = 'tikz-error-icon';
          errorHeader.appendChild(errorIcon);

          // Add error title
          const errorTitle = document.createElement('span');
          errorTitle.className = 'tikz-error-title';
          errorTitle.textContent = 'TikZ Error';
          errorHeader.appendChild(errorTitle);

          errorContainer.appendChild(errorHeader);

          // Create error message - always highlight to make it stand out
          const errorMessage = document.createElement('div');
          errorMessage.className = 'tikz-error-message specific-error';
          errorMessage.textContent = error.message || 'Unknown error';
          errorContainer.appendChild(errorMessage);

          // Add a note about checking server logs
          const noteEl = document.createElement('div');
          noteEl.className = 'tikz-error-note';
          noteEl.textContent = 'For more details, check the server logs or try running the TikZ code in a LaTeX editor.';
          errorContainer.appendChild(noteEl);

          // Add the error container to the error element
          errorEl.appendChild(errorContainer);
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
        // For SVG, we can directly insert the content
        contentEl.innerHTML = renderResult.content;
      } else if (renderResult.format === 'pdf') {
        // For PDF, we need to create an object or embed element
        const pdfEmbed = contentEl.createEl('embed', {
          attr: {
            type: 'application/pdf',
            src: `data:application/pdf;base64,${renderResult.content}`,
            width: '100%',
            height: '400px'
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

    errorEl.style.display = 'none';

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
          // For SVG, we can directly insert the content
          contentEl.innerHTML = renderResult.content;
        } else if (renderResult.format === 'pdf') {
          // For PDF, we need to create an object or embed element
          const pdfEmbed = contentEl.createEl('embed', {
            attr: {
              type: 'application/pdf',
              src: `data:application/pdf;base64,${renderResult.content}`,
              width: '100%',
              height: '400px'
            }
          });
        }
      }
    } catch (error: any) {
      // Handle error
      loadingEl.remove();
      errorEl.style.display = 'block';

      // Log the error for debugging
      console.log('TikZ refresh error object:', error);
      console.log('Error message:', error.message);
      console.log('Has errorHTML:', !!error.errorHTML);
      console.log('Has errorInfo:', !!error.errorInfo);

      // Clear the error element
      errorEl.empty();

      // Check if the error has structured error information
      if (error.errorInfo || error.errorHTML) {
        this.createStructuredErrorDisplay(errorEl, error);
      } else {
        // Create a basic error container with improved styling
        const errorContainer = document.createElement('div');
        errorContainer.className = 'tikz-error-container';

        // Create error header
        const errorHeader = document.createElement('div');
        errorHeader.className = 'tikz-error-header error';

        // Add error icon
        const errorIcon = document.createElement('span');
        errorIcon.className = 'tikz-error-icon';
        errorHeader.appendChild(errorIcon);

        // Add error title
        const errorTitle = document.createElement('span');
        errorTitle.className = 'tikz-error-title';
        errorTitle.textContent = 'TikZ Error';
        errorHeader.appendChild(errorTitle);

        errorContainer.appendChild(errorHeader);

        // Create error message - always highlight to make it stand out
        const errorMessage = document.createElement('div');
        errorMessage.className = 'tikz-error-message specific-error';
        errorMessage.textContent = error.message || 'Unknown error';
        errorContainer.appendChild(errorMessage);

        // Add a note about checking server logs
        const noteEl = document.createElement('div');
        noteEl.className = 'tikz-error-note';
        noteEl.textContent = 'For more details, check the server logs or try running the TikZ code in a LaTeX editor.';
        errorContainer.appendChild(noteEl);

        // Add the error container to the error element
        errorEl.appendChild(errorContainer);
      }

      // Log the error for debugging
      console.error('TikZ refresh error:', error);
    }
  }

  /**
   * Create a structured error display
   */
  private createStructuredErrorDisplay(containerEl: HTMLElement, error: any): void {
    console.log('Creating structured error display with:', error);

    // Clear the container
    containerEl.empty();

    try {
      // If the error has HTML content, use it directly
      if (error.errorHTML) {
        // Create a wrapper div to hold the HTML content
        const wrapper = containerEl.createDiv({ cls: 'tikz-error-wrapper' });
        wrapper.innerHTML = error.errorHTML;

        // Add click handler to toggle details visibility
        setTimeout(() => {
          const errorHeader = wrapper.querySelector('.tikz-error-header');
          const detailsSection = wrapper.querySelector('.tikz-error-details');
          const toggleButton = wrapper.querySelector('.tikz-error-toggle');

          if (errorHeader && detailsSection) {
            // Initially hide details
            detailsSection.style.display = 'none';

            errorHeader.addEventListener('click', () => {
              if (detailsSection.style.display === 'none') {
                detailsSection.style.display = 'block';
                if (toggleButton) toggleButton.textContent = '▲';
              } else {
                detailsSection.style.display = 'none';
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
      const detailsContainer = errorContainer.createDiv({ cls: 'tikz-error-details' });

      // Initially hide the details
      detailsContainer.style.display = 'none';

      // Add toggle functionality
      errorHeader.addEventListener('click', () => {
        if (detailsContainer.style.display === 'none') {
          detailsContainer.style.display = 'block';
          toggleButton.setText('▲');
        } else {
          detailsContainer.style.display = 'none';
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
