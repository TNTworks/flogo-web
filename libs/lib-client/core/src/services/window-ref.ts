import { Injectable } from '@angular/core';

function _window(): Window {
  return window;
}

@Injectable()
/**
 * An injectable reference to the native window
 */
export class WindowRef {
  get nativeWindow(): Window {
    return _window();
  }
}
