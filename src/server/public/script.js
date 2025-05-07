/**
 * Create a structured error display
 */
function createStructuredErrorDisplay(containerEl, errorInfo) {
    // Clear the container
    containerEl.innerHTML = '';

    // Create the error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'tikz-error-container';
    containerEl.appendChild(errorContainer);

    // Error header with severity icon
    const severityClass = errorInfo.severity || 'error';
    const errorHeader = document.createElement('div');
    errorHeader.className = `tikz-error-header ${severityClass}`;
    errorContainer.appendChild(errorHeader);

    const errorIcon = document.createElement('span');
    errorIcon.className = 'tikz-error-icon';
    errorHeader.appendChild(errorIcon);

    const errorTitle = document.createElement('span');
    errorTitle.className = 'tikz-error-title';
    errorTitle.textContent = 'TikZ Error';
    errorHeader.appendChild(errorTitle);

    // Add toggle button for expanding/collapsing details
    const toggleButton = document.createElement('span');
    toggleButton.className = 'tikz-error-toggle';
    toggleButton.textContent = '▼';
    errorHeader.appendChild(toggleButton);

    // Create the main error message section
    const messageContainer = document.createElement('div');
    messageContainer.className = 'tikz-error-message';
    messageContainer.textContent = errorInfo.message || 'Unknown error';
    errorContainer.appendChild(messageContainer);

    // Create collapsible details section
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'tikz-error-details';
    errorContainer.appendChild(detailsContainer);

    // Initially hide the details
    detailsContainer.style.display = 'none';

    // Add toggle functionality
    errorHeader.addEventListener('click', () => {
        if (detailsContainer.style.display === 'none') {
            detailsContainer.style.display = 'block';
            toggleButton.textContent = '▲';
        } else {
            detailsContainer.style.display = 'none';
            toggleButton.textContent = '▼';
        }
    });

    // Add line number if available
    if (errorInfo.line) {
        const lineEl = document.createElement('div');
        lineEl.className = 'tikz-error-line';
        lineEl.textContent = `Line: ${errorInfo.line}`;
        detailsContainer.appendChild(lineEl);
    }

    // Add suggestion if available
    if (errorInfo.suggestion) {
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'tikz-error-suggestion';
        suggestionEl.innerHTML = `<strong>Suggestion:</strong> ${errorInfo.suggestion}`;
        detailsContainer.appendChild(suggestionEl);
    }

    // Add problematic code if available
    if (errorInfo.code) {
        const codeEl = document.createElement('div');
        codeEl.className = 'tikz-error-code';
        codeEl.innerHTML = `<strong>Problematic code:</strong> <code>${errorInfo.code}</code>`;
        detailsContainer.appendChild(codeEl);
    }

    // Add context if available
    if (errorInfo.context) {
        const contextEl = document.createElement('div');
        contextEl.className = 'tikz-error-context';
        contextEl.innerHTML = `<strong>Context:</strong><pre>${errorInfo.context}</pre>`;
        detailsContainer.appendChild(contextEl);
    }

    // Add a note about checking server logs
    const noteEl = document.createElement('div');
    noteEl.className = 'tikz-error-note';
    noteEl.textContent = 'For more details, check the server logs or try running the TikZ code in a LaTeX editor.';
    errorContainer.appendChild(noteEl);

    // Add a "Get Help" button
    if (errorInfo.errorType) {
        const fixButtonContainer = document.createElement('div');
        fixButtonContainer.className = 'tikz-error-fix';
        detailsContainer.appendChild(fixButtonContainer);

        const fixButton = document.createElement('button');
        fixButton.className = 'tikz-fix-button';
        fixButton.textContent = 'Get Help';
        fixButtonContainer.appendChild(fixButton);

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

            window.open(helpUrl, '_blank');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');
    const serverInfoElement = document.getElementById('server-info');
    const engineSelect = document.getElementById('engine');
    const formatSelect = document.getElementById('format');
    const tikzCodeTextarea = document.getElementById('tikz-code');
    const preambleTextarea = document.getElementById('preamble');
    const renderButton = document.getElementById('render-btn');
    const loadingElement = document.getElementById('loading');
    const resultCard = document.getElementById('result-card');
    const resultContentElement = document.getElementById('result-content');
    const errorMessageElement = document.getElementById('error-message');

    // Check server status
    checkServerStatus();

    // Add event listener to render button
    renderButton.addEventListener('click', renderTikZ);

    // Function to check server status
    async function checkServerStatus() {
        try {
            statusElement.textContent = 'Checking...';
            statusElement.className = 'status-indicator status-checking';

            const response = await fetch('/health');
            const data = await response.json();

            if (data.status === 'ok') {
                statusElement.textContent = 'Online';
                statusElement.className = 'status-indicator status-online';

                // Update server info
                let serverInfo = `<p><strong>Version:</strong> ${data.version}</p>`;
                serverInfo += '<p><strong>Available LaTeX Engines:</strong></p>';
                serverInfo += '<ul>';

                if (data.engines.pdflatex) {
                    serverInfo += '<li>pdfLaTeX ✅</li>';
                } else {
                    serverInfo += '<li>pdfLaTeX ❌</li>';
                    disableEngineOption('pdflatex');
                }

                if (data.engines.lualatex) {
                    serverInfo += '<li>LuaLaTeX ✅</li>';
                } else {
                    serverInfo += '<li>LuaLaTeX ❌</li>';
                    disableEngineOption('lualatex');
                }

                if (data.engines.xelatex) {
                    serverInfo += '<li>XeLaTeX ✅</li>';
                } else {
                    serverInfo += '<li>XeLaTeX ❌</li>';
                    disableEngineOption('xelatex');
                }

                serverInfo += '</ul>';
                serverInfoElement.innerHTML = serverInfo;
            } else {
                throw new Error('Server reported error status');
            }
        } catch (error) {
            statusElement.textContent = 'Offline';
            statusElement.className = 'status-indicator status-offline';
            serverInfoElement.innerHTML = '<p class="error-message">Could not connect to server. Please make sure the server is running.</p>';
            renderButton.disabled = true;
        }
    }

    // Function to disable engine options that are not available
    function disableEngineOption(engine) {
        const option = Array.from(engineSelect.options).find(opt => opt.value === engine);
        if (option) {
            option.disabled = true;
            option.textContent += ' (Not available)';
        }
    }

    // Function to render TikZ
    async function renderTikZ() {
        try {
            // Show loading indicator
            loadingElement.style.display = 'flex';
            renderButton.disabled = true;
            resultCard.style.display = 'none';
            errorMessageElement.style.display = 'none';

            const tikzCode = tikzCodeTextarea.value.trim();
            if (!tikzCode) {
                throw new Error('TikZ code cannot be empty');
            }

            // Fix backslash escaping in TikZ code
            const fixedTikzCode = tikzCode.replace(/\\\\/g, '\\');
            const fixedPreamble = preambleTextarea.value.replace(/\\\\/g, '\\');

            const requestData = {
                tikzCode: fixedTikzCode,
                format: formatSelect.value,
                engine: engineSelect.value,
                preamble: fixedPreamble
            };

            const response = await fetch('/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            resultCard.style.display = 'block';

            // Check if the response contains an error field or success: false
            if (data.error || data.success === false) {
                // Create an error object with the response data
                const error = new Error(data.error || 'Unknown error occurred');
                error.errorData = data;
                throw error;
            }

            // If we get here, it's a successful render
            if (data.format === 'svg') {
                resultContentElement.innerHTML = data.content;
            } else if (data.format === 'pdf') {
                const pdfUrl = `data:application/pdf;base64,${data.content}`;
                resultContentElement.innerHTML = `
                    <embed src="${pdfUrl}" type="application/pdf" width="100%" height="500px">
                    <p><a href="${pdfUrl}" download="tikz.pdf" class="btn">Download PDF</a></p>
                `;
            }
        } catch (error) {
            resultCard.style.display = 'block';

            // Reset error message element
            errorMessageElement.className = 'error-message';
            errorMessageElement.style.display = 'block';
            resultContentElement.innerHTML = '';

            console.log('Error object:', error);

            // Check if the error has structured error data
            if (error.errorData) {
                const errorData = error.errorData;
                console.log('Error data:', errorData);

                if (errorData.errorHTML) {
                    // Use the HTML error display
                    errorMessageElement.innerHTML = errorData.errorHTML;

                    // Add click handler to toggle details visibility
                    setTimeout(() => {
                        const errorHeader = errorMessageElement.querySelector('.tikz-error-header');
                        const detailsSection = errorMessageElement.querySelector('.tikz-error-details');
                        const toggleButton = errorMessageElement.querySelector('.tikz-error-toggle');

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
                } else if (errorData.errorInfo) {
                    // Create a structured error display
                    createStructuredErrorDisplay(errorMessageElement, errorData.errorInfo);
                } else {
                    // Simple error message with improved styling
                    const errorContainer = document.createElement('div');
                    errorContainer.className = 'tikz-error-container';

                    const errorHeader = document.createElement('div');
                    errorHeader.className = 'tikz-error-header error';

                    const errorIcon = document.createElement('span');
                    errorIcon.className = 'tikz-error-icon';
                    errorHeader.appendChild(errorIcon);

                    const errorTitle = document.createElement('span');
                    errorTitle.className = 'tikz-error-title';
                    errorTitle.textContent = 'TikZ Error';
                    errorHeader.appendChild(errorTitle);

                    errorContainer.appendChild(errorHeader);

                    const messageEl = document.createElement('div');
                    messageEl.className = 'tikz-error-message';
                    messageEl.textContent = errorData.error || error.message || 'Unknown error';
                    errorContainer.appendChild(messageEl);

                    errorMessageElement.appendChild(errorContainer);
                }
            } else {
                // Create a simple but styled error message
                const errorContainer = document.createElement('div');
                errorContainer.className = 'tikz-error-container';

                const errorHeader = document.createElement('div');
                errorHeader.className = 'tikz-error-header error';

                const errorIcon = document.createElement('span');
                errorIcon.className = 'tikz-error-icon';
                errorHeader.appendChild(errorIcon);

                const errorTitle = document.createElement('span');
                errorTitle.className = 'tikz-error-title';
                errorTitle.textContent = 'TikZ Error';
                errorHeader.appendChild(errorTitle);

                errorContainer.appendChild(errorHeader);

                const messageEl = document.createElement('div');
                messageEl.className = 'tikz-error-message';
                messageEl.textContent = error.message || 'Unknown error';
                errorContainer.appendChild(messageEl);

                const noteEl = document.createElement('div');
                noteEl.className = 'tikz-error-note';
                noteEl.textContent = 'For more details, check the server logs or try running the TikZ code in a LaTeX editor.';
                errorContainer.appendChild(noteEl);

                errorMessageElement.appendChild(errorContainer);
            }
        } finally {
            // Hide loading indicator
            loadingElement.style.display = 'none';
            renderButton.disabled = false;
        }
    }
});
