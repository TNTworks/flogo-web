import { Directive, ElementRef, HostListener, Input } from '@angular/core';

interface DownloadableData {
  fileName: string;
  data: any;
}

@Directive({
  selector: '[fgJsonDownloader]',
})
export class JsonDownloaderDirective {
  private _el: HTMLElement;
  private _link: HTMLAnchorElement;

  /* tslint:disable:no-input-rename */
  @Input('fgJsonDownloader')
  generateObject: () => Promise<DownloadableData | DownloadableData[]> = () => null;

  constructor(private el: ElementRef) {
    this._el = el.nativeElement;
  }

  @HostListener('click')
  onClick() {
    this.generateObject().then(result => {
      let outputs = [];

      if (result) {
        outputs = <{ fileName: string; data: any }[]>(
          (result.constructor === Array ? result : [result])
        );

        this._link = document.createElement('a');
        this._link.setAttribute('download', 'flow.json');
        this._link.style.display = 'none';
        document.body.appendChild(this._link);
      }

      outputs.forEach(output => {
        const jsonString = JSON.stringify(output.data, null, 2);
        const dataString = `data:text/json;charset=utf-8,${encodeURIComponent(
          jsonString
        )}`;

        this._link.setAttribute('href', dataString);
        this._link.setAttribute('download', output.fileName || 'flow.json');
        // if download attribute is not supported
        if (!this._link.download) {
          this._link.setAttribute('target', '_blank');
        }
        this._link.click();
      });

      if (result) {
        document.body.removeChild(this._link);
      }
    });
  }
}
