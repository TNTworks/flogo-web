import { Injectable } from '@angular/core';
import { WindowRef } from './window-ref';

@Injectable({
  providedIn: 'root',
})
/**
 * Simple local storage wrapper, mainly to be able to mock the local storage for component testing
 */
export class LocalStorageService {
  private storage: Storage;
  constructor(windowRef: WindowRef) {
    this.storage = windowRef.nativeWindow.localStorage;
  }

  clear(): void {
    return this.storage.clear();
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  removeItem(key: string): void {
    return this.storage.removeItem(key);
  }

  setItem(key: string, value: string) {
    this.storage.setItem(key, value);
  }
}
