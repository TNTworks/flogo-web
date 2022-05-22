import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WindowRef } from './window-ref';
import { getFileName } from './restapi/restapi-utils';

@Injectable()
export class FileDownloaderService {
  private window: Window;

  constructor(@Inject(DOCUMENT) private document: Document, windowRef: WindowRef) {
    this.window = windowRef.nativeWindow;
  }

  downloadResolver() {
    return (request: Observable<HttpResponse<Blob>>) =>
      request.pipe(
        map(response => {
          const responseHeader = response.headers.get('content-disposition');
          const fileName = getFileName(responseHeader);
          this.download(response.body, fileName);
        })
      );
  }

  download(content: ArrayBuffer | Blob, fileName = 'file') {
    const URL = (this.window as any).URL;
    const url = URL.createObjectURL(content);
    const link = this.document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);
  }
}
