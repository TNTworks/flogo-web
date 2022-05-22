import { Injectable } from '@angular/core';
import { Resource, ApiResource } from '@flogo-web/core';
import { HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { RestApiService } from '../rest-api.service';

interface ListOpts {
  fields?: Array<keyof Resource>;
  filter?: {
    [fieldName: string]: string;
  };
}

// makes name and type required while the rest of the properties are optional
export type NewResource = Pick<Resource, 'name' | 'type'> & Partial<Resource>;

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  constructor(private restApi: RestApiService) {}

  getResource<RData = unknown>(resourceId: string): Observable<ApiResource<RData>> {
    return this.restApi.get<ApiResource<RData>>(`resources/${resourceId}`);
  }

  createResource<RData = unknown>(
    appId: string,
    resource: NewResource
  ): Observable<ApiResource<RData>> {
    return this.restApi.post<ApiResource<RData>>(`apps/${appId}/resources`, resource);
  }

  updateResource(resourceId: string, resource: Resource): Observable<boolean> {
    // prettier-ignore
    return this.restApi.patch(`resources/${resourceId}`, resource)
      .pipe(map(() => true));
  }

  deleteResource(resourceId): Observable<boolean> {
    // prettier-ignore
    return this.restApi.delete(`resources/${resourceId}`)
      .pipe(map(() => true));
  }

  listResources(
    appId: string,
    opts?: ListOpts
  ): Observable<Array<ApiResource | Partial<ApiResource>>> {
    let params = new HttpParams();
    if (opts.fields) {
      params = params.set('fields', opts.fields.join(','));
    }
    if (opts.filter) {
      params = setFilters(params, opts.filter);
    }
    return this.restApi.get<Array<ApiResource>>(`apps/${appId}/resources`, {
      params,
    });
  }

  listResourcesWithName(name: string, appId: string) {
    return this.listResources(appId, {
      filter: { name },
    });
  }

  listSubresources(appId: string, flowIds?: string[]): Observable<ApiResource[]> {
    const filter: ListOpts['filter'] = {};
    if (flowIds && flowIds.length > 0) {
      filter.id = flowIds.join(',');
    }
    return this.listResources(appId, {
      fields: ['id', 'name', 'description', 'metadata', 'createdAt'],
      filter,
    }) as Observable<ApiResource[]>;
  }
}

function setFilters(inParams: HttpParams, filters: { [fieldName: string]: string }) {
  return Object.entries(filters).reduce((params, [fieldName, fieldValue]) => {
    return params.set(`filter[${fieldName}]`, fieldValue);
  }, inParams);
}
