import { App, PluginSettingTab, Setting } from 'obsidian';
import TikZAdvancedPlugin from '../main';

export interface TikZAdvancedSettings {
  // Server settings
  serverUrl: string;

  // Rendering settings
  defaultOutputFormat: 'svg' | 'pdf';
  enableZoom: boolean;
  preferredEngine: 'pdflatex' | 'lualatex' | 'xelatex';
  autoRefresh: boolean;

  // Cache settings
  cacheEnabled: boolean;
  cacheTTL: number; // Time to live in minutes
  showCacheIndicator: boolean;

  // Advanced settings
  customPreamble: string;
  debugMode: boolean;

  // Method to save settings
  save: () => Promise<void>;
}

export const DEFAULT_SETTINGS: Omit<TikZAdvancedSettings, 'save'> = {
  // Server settings
  serverUrl: 'http://localhost:3000',

  // Rendering settings
  defaultOutputFormat: 'svg',
  enableZoom: true,
  preferredEngine: 'pdflatex',
  autoRefresh: true,

  // Cache settings
  cacheEnabled: true,
  cacheTTL: 60, // 1 hour
  showCacheIndicator: true,

  // Advanced settings
  customPreamble: '', // Empty by default - server will add necessary packages
  debugMode: false,
};
