// Minimal type definitions for Obsidian API
declare module 'obsidian' {
  export class Plugin {
    app: App;
    manifest: PluginManifest;

    constructor(app: App, manifest: PluginManifest);

    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;

    addSettingTab(settingTab: PluginSettingTab): void;
    registerMarkdownCodeBlockProcessor(language: string, processor: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => void | Promise<void>): void;
  }

  export interface App {
    workspace: Workspace;
  }

  export interface Workspace {
    activeLeaf: WorkspaceLeaf | null;
  }

  export interface WorkspaceLeaf {
    view: View;
  }

  export interface View {
    getViewType(): string;
  }

  export interface MarkdownView extends View {
    getMode(): string;
    getDisplayText(): string;
  }

  export interface MarkdownPostProcessorContext {
    docId: string;
    sourcePath: string;
    frontmatter: any | null;
  }

  export class PluginSettingTab {
    app: App;
    plugin: Plugin;
    containerEl: HTMLElement;

    constructor(app: App, plugin: Plugin);

    display(): void;
    hide(): void;
  }

  export class Setting {
    constructor(containerEl: HTMLElement);

    setName(name: string): this;
    setDesc(desc: string): this;
    setClass(cls: string): this;

    addText(cb: (text: TextComponent) => any): this;
    addTextArea(cb: (text: TextAreaComponent) => any): this;
    addToggle(cb: (toggle: ToggleComponent) => any): this;
    addButton(cb: (button: ButtonComponent) => any): this;
    addDropdown(cb: (dropdown: DropdownComponent) => any): this;
  }

  export interface TextComponent {
    setValue(value: string): this;
    getValue(): string;
    onChange(callback: (value: string) => any): this;
    setPlaceholder(placeholder: string): this;
  }

  export interface TextAreaComponent {
    setValue(value: string): this;
    getValue(): string;
    onChange(callback: (value: string) => any): this;
    setPlaceholder(placeholder: string): this;
  }

  export interface ToggleComponent {
    setValue(value: boolean): this;
    getValue(): boolean;
    onChange(callback: (value: boolean) => any): this;
  }

  export interface ButtonComponent {
    setButtonText(text: string): this;
    onClick(callback: () => any): this;
  }

  export interface DropdownComponent {
    addOption(value: string, display: string): this;
    setValue(value: string): this;
    getValue(): string;
    onChange(callback: (value: string) => any): this;
  }

  export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    minAppVersion: string;
    description: string;
    author: string;
    authorUrl: string;
    isDesktopOnly: boolean;
  }

  export class Notice {
    constructor(message: string, timeout?: number);
  }

  export function requestUrl(request: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    contentType?: string;
    body?: string;
    throw?: boolean;
  }): Promise<{
    status: number;
    headers: Record<string, string>;
    text: string;
    json: any;
  }>;

  // Add HTMLElement extensions for Obsidian
  declare global {
    interface HTMLElement {
      createDiv(options?: { cls?: string }): HTMLElement;
      createSpan(options?: { cls?: string; text?: string }): HTMLElement;
      createEl<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: { cls?: string; text?: string; attr?: Record<string, string> }): HTMLElementTagNameMap[K];
      setText(text: string): HTMLElement;
      empty(): HTMLElement;
      addClass(cls: string): HTMLElement;
      removeClass(cls: string): HTMLElement;
    }
  }
}
