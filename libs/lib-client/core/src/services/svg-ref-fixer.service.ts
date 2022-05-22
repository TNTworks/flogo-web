import { Inject, Injectable } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { WindowRef } from './window-ref';

const PATTERN_FUNCTIONAL = /url\((.*)#/;
const PATTERN_HASHED = /(.*)#/;
const replaceFunctionalUrl = (path: string, inString: string) =>
  inString.replace(PATTERN_FUNCTIONAL, `url(${path}#`);
const replaceHashedRef = (path: string, inString: string) =>
  inString.replace(PATTERN_HASHED, `${path}#`);
const fixRefIfNeeded = (path: string, attrVal: string) => {
  if (PATTERN_FUNCTIONAL.test(attrVal)) {
    return replaceFunctionalUrl(path, attrVal);
  } else if (PATTERN_HASHED.test(attrVal)) {
    return replaceHashedRef(path, attrVal);
  } else {
    return attrVal;
  }
};

@Injectable()
export class SvgRefFixerService {
  browserRequiresFix: boolean;

  constructor(
    private location: Location,
    @Inject(DOCUMENT) document: Document,
    windowRef: WindowRef
  ) {
    const navigator = windowRef.nativeWindow.navigator;
    this.browserRequiresFix = Boolean(
      document['documentMode'] ||
        /(Edge)|(Version\/[\d\.]+.*Safari)/.test(navigator.userAgent)
    );
  }

  getFixedRef(value: string) {
    if (!this.browserRequiresFix) {
      return value;
    }
    const path = this.location.path(false);
    return fixRefIfNeeded(path, value);
  }
}
