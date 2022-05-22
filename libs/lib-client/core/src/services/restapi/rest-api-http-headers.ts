import { InjectionToken } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

export const DEFAULT_REST_HEADERS = new InjectionToken<HttpHeaders>(
  'core.service.default-rest-api-headers'
);

export function createDefaultRestApiHttpHeaders() {
  return new HttpHeaders({
    Accept: 'application/json',
  });
}
