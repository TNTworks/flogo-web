import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpUtilsService } from '../http-utils.service';
import { FileDownloaderService } from '../../file-downloader.service';

@Injectable()
export class ShimTriggerBuildService {
  constructor(
    private httpUtilsService: HttpUtilsService,
    private http: HttpClient,
    private downloaderService: FileDownloaderService
  ) {}

  public buildShimTrigger(shimTrigger) {
    const buildURL = this.getShimTriggerBuildLink(shimTrigger.triggerId);
    let params = new HttpParams();
    if (shimTrigger.env) {
      params = params.append('os', shimTrigger.env.os);
      params = params.append('arch', shimTrigger.env.arch);
    }
    return this.http
      .get(buildURL, { params, responseType: 'blob', observe: 'response' })
      .pipe(this.downloaderService.downloadResolver());
  }

  private getShimTriggerBuildLink(triggerId: string) {
    return this.httpUtilsService.apiPrefix(`triggers/${triggerId}:shim`);
  }
}
