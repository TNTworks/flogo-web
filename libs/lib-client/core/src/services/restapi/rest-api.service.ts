import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpUtilsService } from './http-utils.service';
import { DEFAULT_REST_HEADERS } from './rest-api-http-headers';

export interface RestApiOptions {
  headers?: {
    [header: string]: string | string[];
  };
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
}

interface RestApiResponseBody<T> {
  data: T;
}

const isStdResponseBody = <T>(r): r is RestApiResponseBody<T> => r && r.data;

@Injectable()
export class RestApiService {
  constructor(
    @Inject(DEFAULT_REST_HEADERS) private defaultHeaders: HttpHeaders,
    private http: HttpClient,
    private httpUtils: HttpUtilsService
  ) {}

  get<T>(endpoint: string, options?: RestApiOptions): Observable<T> {
    return this.request<T>('get', endpoint, options);
  }

  delete<T>(endpoint: string, options?: RestApiOptions): Observable<T> {
    return this.request<T>('delete', endpoint, options);
  }

  post<T>(endpoint: string, body?: any, options?: RestApiOptions): Observable<T> {
    return this.request<T>('post', endpoint, { ...options, body });
  }

  patch<T>(endpoint: string, body?: any, options?: RestApiOptions): Observable<T> {
    return this.request<T>('patch', endpoint, { ...options, body });
  }

  put<T>(endpoint: string, body?: any, options?: RestApiOptions): Observable<T> {
    return this.request<T>('put', endpoint, { ...options, body });
  }

  apiPrefix(path) {
    return this.httpUtils.apiPrefix(path);
  }

  private request<T>(
    verb,
    url,
    options: RestApiOptions & { body?: any } = {}
  ): Observable<T> {
    return this.http
      .request<RestApiResponseBody<T> | T>(
        verb,
        this.apiPrefix(url),
        this.mergeOptions(verb, options)
      )
      .pipe(map(response => (isStdResponseBody(response) ? response.data : response)));
  }

  private mergeOptions(verb: string, options: RestApiOptions = {}) {
    options = { ...options };
    if (this.requestForVerbHasBody(verb)) {
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }
    const headers = this.mergeWithDefaultHeaders(options.headers);
    return { ...options, headers };
  }

  private mergeWithDefaultHeaders(withHeaders: RestApiOptions['headers']): HttpHeaders {
    if (!withHeaders) {
      return this.defaultHeaders;
    }
    return Object.entries(withHeaders).reduce((headers, [headerName, headerValue]) => {
      return this.defaultHeaders.set(headerName, headerValue);
    }, this.defaultHeaders);
  }

  private requestForVerbHasBody(verb) {
    return ['post', 'put', 'patch'].includes(verb);
  }
}
