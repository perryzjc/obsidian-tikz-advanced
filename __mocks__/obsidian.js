// Mock for Obsidian API
module.exports = {
  Plugin: class Plugin {
    registerMarkdownCodeBlockProcessor() {}
    addSettingTab() {}
    loadData() { return Promise.resolve({}); }
    saveData() { return Promise.resolve(); }
  },
  PluginSettingTab: class PluginSettingTab {
    constructor() {}
    display() {}
  },
  Setting: class Setting {
    constructor() {
      return {
        setName: () => this,
        setDesc: () => this,
        addText: () => this,
        addToggle: () => this,
        addDropdown: () => this,
        addButton: () => this,
      };
    }
  },
  Notice: class Notice {
    constructor(message) {
      console.log(`Notice: ${message}`);
    }
  },
  requestUrl: jest.fn().mockResolvedValue({ text: 'mocked response' }),
  MarkdownView: class MarkdownView {},
  WorkspaceLeaf: class WorkspaceLeaf {},
};
