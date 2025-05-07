import { App, PluginSettingTab, Setting } from 'obsidian';
import TikZAdvancedPlugin from '../main';

export class TikZSettingTab extends PluginSettingTab {
  plugin: TikZAdvancedPlugin;

  constructor(app: App, plugin: TikZAdvancedPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Server Settings
    containerEl.createEl('h3', { text: 'Server Settings' });

    new Setting(containerEl)
      .setName('TikZ Server URL')
      .setDesc('URL of the TikZ rendering server')
      .addText(text => {
        text.setPlaceholder('http://localhost:3000')
          .setValue(this.plugin.settings.serverUrl)
          .onChange(async (value) => {
            this.plugin.settings.serverUrl = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Preferred LaTeX Engine')
      .setDesc('Select the LaTeX engine to use for rendering')
      .addDropdown(dropdown => dropdown
        .addOption('pdflatex', 'pdfLaTeX')
        .addOption('lualatex', 'LuaLaTeX')
        .addOption('xelatex', 'XeLaTeX')
        .setValue(this.plugin.settings.preferredEngine)
        .onChange(async (value: 'pdflatex' | 'lualatex' | 'xelatex') => {
          this.plugin.settings.preferredEngine = value;
          await this.plugin.saveSettings();
        }));

    // Rendering Settings
    containerEl.createEl('h3', { text: 'Rendering Settings' });

    new Setting(containerEl)
      .setName('Default Output Format')
      .setDesc('Choose the default output format for TikZ diagrams')
      .addDropdown(dropdown => dropdown
        .addOption('svg', 'SVG')
        .addOption('pdf', 'PDF')
        .setValue(this.plugin.settings.defaultOutputFormat)
        .onChange(async (value: 'svg' | 'pdf') => {
          this.plugin.settings.defaultOutputFormat = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable Zoom')
      .setDesc('Allow zooming in and out of TikZ diagrams')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableZoom)
        .onChange(async (value) => {
          this.plugin.settings.enableZoom = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto Refresh')
      .setDesc('Automatically refresh diagrams when code changes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoRefresh)
        .onChange(async (value) => {
          this.plugin.settings.autoRefresh = value;
          await this.plugin.saveSettings();
        }));

    // Cache Settings
    containerEl.createEl('h3', { text: 'Cache Settings' });

    new Setting(containerEl)
      .setName('Enable Cache')
      .setDesc('Cache rendered TikZ diagrams to improve performance')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.cacheEnabled)
        .onChange(async (value) => {
          this.plugin.settings.cacheEnabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Cache TTL (minutes)')
      .setDesc('Time to live for cached diagrams in minutes')
      .addText(text => text
        .setPlaceholder('60')
        .setValue(String(this.plugin.settings.cacheTTL))
        .onChange(async (value) => {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > 0) {
            this.plugin.settings.cacheTTL = numValue;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Show Cache Indicator')
      .setDesc('Show an indicator when a diagram is loaded from cache')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCacheIndicator)
        .onChange(async (value) => {
          this.plugin.settings.showCacheIndicator = value;
          await this.plugin.saveSettings();
        }));

    // Advanced Settings
    containerEl.createEl('h3', { text: 'Advanced Settings' });

    new Setting(containerEl)
      .setName('Custom Preamble')
      .setDesc('Additional LaTeX packages or commands. Note: The server already includes tikz, pgfplots, and common libraries.')
      .addTextArea(text => text
        .setPlaceholder('\\usepackage{tikz-cd}\n\\usepackage{tikz-3dplot}\n\\usetikzlibrary{decorations.pathmorphing}')
        .setValue(this.plugin.settings.customPreamble)
        .onChange(async (value) => {
          this.plugin.settings.customPreamble = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc('Enable debug mode for troubleshooting')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        }));

    // Test Connection Button
    new Setting(containerEl)
      .setName('Test Server Connection')
      .setDesc('Test the connection to the TikZ rendering server')
      .addButton(button => button
        .setButtonText('Test Connection')
        .onClick(async () => {
          // Remove any existing status elements
          containerEl.querySelectorAll('.connection-status').forEach(el => el.remove());

          const statusEl = containerEl.createDiv('connection-status');
          statusEl.createEl('h4', { text: 'Connection Status' });

          const statusTextEl = statusEl.createDiv('status-text');
          statusTextEl.createEl('span', { text: 'Testing connection...' });

          try {
            const isConnected = await this.plugin.serverConnector.testConnection();
            statusTextEl.empty();

            if (isConnected) {
              statusTextEl.createEl('span', {
                text: '✅ Connected to server successfully',
                cls: 'status-success'
              });

              // Get server info
              try {
                const serverInfo = await this.plugin.serverConnector.getServerInfo();
                const infoEl = statusEl.createDiv('server-info');

                infoEl.createEl('div', {
                  text: `Server Version: ${serverInfo.version}`
                });

                const enginesEl = infoEl.createEl('div', { text: 'Available Engines:' });
                const enginesList = enginesEl.createEl('ul');

                for (const [engine, available] of Object.entries(serverInfo.engines)) {
                  enginesList.createEl('li', {
                    text: `${engine}: ${available ? '✅ Available' : '❌ Not Available'}`
                  });
                }
              } catch (infoError) {
                // Ignore server info errors
              }
            } else {
              statusTextEl.createEl('span', {
                text: '❌ Failed to connect to server',
                cls: 'status-error'
              });

              // Add troubleshooting tips
              const tipsEl = statusEl.createDiv('troubleshooting-tips');
              tipsEl.createEl('h5', { text: 'Troubleshooting Tips:' });

              const tipsList = tipsEl.createEl('ul');
              tipsList.createEl('li', {
                text: 'Make sure the server is running'
              });
              tipsList.createEl('li', {
                text: 'Check that the server URL is correct'
              });
              tipsList.createEl('li', {
                text: 'Try starting the server using the controls above'
              });
              tipsList.createEl('li', {
                text: 'Check for firewall or network issues'
              });
            }
          } catch (error) {
            statusTextEl.empty();
            statusTextEl.createEl('span', {
              text: `❌ Error: ${error.message}`,
              cls: 'status-error'
            });
          }
        }));
  }
}
