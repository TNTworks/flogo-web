export interface Tab {
  labelKey: string;
  isSelected: boolean;
  isDirty: boolean;
  isValid: boolean;
  enabled: boolean;
  inputsLabelKey?: string;
  outputsLabelKey?: string;
}

export const makeTab = (labelKey: string) => ({
  labelKey,
  isSelected: false,
  isDirty: false,
  isValid: true,
  enabled: true,
});

export class Tabs implements Iterable<[string, Tab]> {
  private tabs: Map<string, Tab>;

  [Symbol.iterator]: () => Iterator<[string, Tab]>;

  static create(tabsInfo: any[]): Tabs {
    return new Tabs(tabsInfo);
  }

  constructor(tabsInfo: any[]) {
    const tabPairs = tabsInfo.map(
      ({ name, labelKey }) => [name, makeTab(labelKey)] as [string, Tab]
    );
    this.tabs = new Map<string, Tab>(tabPairs);
    this[Symbol.iterator] = this.tabs[Symbol.iterator].bind(this.tabs);
  }

  get(tabName: string) {
    return this.tabs.get(tabName);
  }

  clear() {
    this.tabs.clear();
  }

  markSelected(tabName: string) {
    this.tabs.forEach((tab: Tab, currentTabName: string) => {
      tab.isSelected = tabName === currentTabName;
    });
  }

  areDirty() {
    const dirtyTab = Array.from(this.tabs.values()).find(tab => tab.isDirty);
    return !!dirtyTab;
  }

  areValid() {
    const invalidTab = Array.from(this.tabs.values()).find(tab => !tab.isValid);
    return !invalidTab;
  }
}
