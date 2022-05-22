import { Injectable } from '@angular/core';
import { ApiResource } from '@flogo-web/core';

@Injectable({
  providedIn: 'root',
})
export class ActivatedResourceRoute<ResourceData = unknown> {
  resourceId: string | null;
  resource: ApiResource<ResourceData> | null;
  configure(resourceId: string, resource: ApiResource<ResourceData>) {
    this.resourceId = resourceId;
    this.resource = resource;
  }

  clear() {
    this.resourceId = null;
    this.resource = null;
  }
}
