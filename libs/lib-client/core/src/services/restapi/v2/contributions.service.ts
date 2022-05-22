import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContributionSchema } from '@flogo-web/core';
import { FLOGO_CONTRIB_TYPE } from '../../../constants';
import { RestApiService } from '../rest-api.service';

@Injectable()
export class ContributionsService {
  constructor(private restApi: RestApiService) {}

  getContributionDetails<T extends ContributionSchema = ContributionSchema>(
    ref: string
  ): Promise<T> {
    return this.restApi
      .get<Array<T>>(this.getApiPath() + '?filter[ref]=' + ref)
      .pipe(map(([schema]) => schema))
      .toPromise();
  }

  getShimContributionDetails<T extends ContributionSchema = ContributionSchema>() {
    return this.restApi.get<T[]>(this.getApiPath() + '?filter[shim]=' + true);
  }

  listContribs<T extends ContributionSchema = ContributionSchema>(
    type?: FLOGO_CONTRIB_TYPE
  ) {
    const apiPath = type
      ? this.getApiPath() + '?filter[type]=' + type
      : this.getApiPath();
    return this.restApi.get<T[]>(apiPath).toPromise();
  }

  installContributions({
    url,
  }): Observable<{ details: string; ref: string; originalUrl: string }> {
    return this.restApi.post(this.getApiPath(), { url });
  }

  private getApiPath(): string {
    return 'contributions/microservices';
  }
}
