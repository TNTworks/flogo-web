import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedResourceRoute } from '@flogo-web/lib-client/core';

import { FlogoFlowService, FlowData, ResourceFlowData } from './core';

@Injectable()
export class FlowDataResolver implements Resolve<FlowData> {
  constructor(
    private flowService: FlogoFlowService,
    private activatedResource: ActivatedResourceRoute<ResourceFlowData>
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.flowService.loadFlow(this.activatedResource.resource);
  }
}
