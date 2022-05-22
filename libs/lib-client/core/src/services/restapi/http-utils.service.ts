import { Injectable, Inject, Optional } from '@angular/core';
import { HOSTNAME } from './hostname.token';

@Injectable()
export class HttpUtilsService {
  private prefix: string;

  constructor(@Optional() @Inject(HOSTNAME) hostname?: string) {
    hostname = hostname || '';
    this.prefix = hostname + '/api/v2/';
  }

  apiPrefix(path?: string) {
    return `${this.prefix}${path}`;
  }
}
