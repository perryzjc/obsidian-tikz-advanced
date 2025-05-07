import { Plugin, MarkdownPostProcessorContext, MarkdownView, Notice } from 'obsidian';
import { TikZAdvancedSettings, DEFAULT_SETTINGS } from './client/settings';
import { TikZSettingTab } from './client/settingsTab';
import { TikZRenderer } from './client/tikzRenderer';
import { TikZCache } from './client/tikzCache';
import { TikZServerConnector } from './client/tikzServerConnector';
import { ServerManager } from './client/serverManager';

export default class TikZAdvancedPlugin extends Plugin {
  settings: TikZAdvancedSettings;
  renderer: TikZRenderer;
  cache: TikZCache;
  serverConnector: TikZServerConnector;
  serverManager: ServerManager | null = null;

  async onload() {
    // Load settings
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

    // Add save method to settings
    this.settings.save = async () => {
      await this.saveSettings();
    };

    // Initialize cache
    this.cache = new TikZCache(this);

    // Initialize server connector
    this.serverConnector = new TikZServerConnector(this);

    // Initialize renderer
    this.renderer = new TikZRenderer(this);

    // Initialize server manager
    this.serverManager = new ServerManager(this.settings);

    // Register the tikz code block processor
    this.registerMarkdownCodeBlockProcessor('tikz', this.processTikZBlock.bind(this));

    // Add settings tab
    this.addSettingTab(new TikZSettingTab(this.app, this));

    // Check server connection
    this.checkServerConnection();
  }



  /**
   * Process a TikZ code block
   */
  async processTikZBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    await this.renderer.render(source, el, ctx);
  }

  /**
   * Check the server connection
   */
  async checkServerConnection() {
    try {
      const isConnected = await this.serverConnector.testConnection();
      if (!isConnected) {
        new Notice('TikZ server connection failed. Please check your server settings.');
        if (this.settings.debugMode) {
          console.error('TikZ server connection failed');
        }
      }
    } catch (error) {
      new Notice(`TikZ server connection error: ${error.message}`);
      if (this.settings.debugMode) {
        console.error('TikZ server connection error:', error);
      }
    }
  }

  /**
   * Clean up when the plugin is unloaded
   */
  onunload() {
    // Clean up the server manager if it exists
    if (this.serverManager) {
      this.serverManager.shutdown();
    }
    
    // Clean up the cache
    this.cache.clear();
    
    // Clean up any other resources
    if (this.renderer) {
      this.renderer.cleanup();
    }
  }

  /**
   * Save the plugin settings
   */
  async saveSettings() {
    await this.saveData(this.settings);
  }
}
