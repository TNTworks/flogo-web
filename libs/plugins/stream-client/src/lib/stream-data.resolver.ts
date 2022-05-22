import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ActivatedResourceRoute } from '@flogo-web/lib-client/core';
import { StreamService } from './core';

/* streams-plugin-todo: implement interface for stream redux state */
@Injectable()
export class StreamDataResolver implements Resolve<unknown> {
  /* streams-plugin-todo: implement interface for stream api response */
  constructor(
    private streamOps: StreamService,
    private activatedResource: ActivatedResourceRoute<unknown>
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.streamOps.loadStream(this.activatedResource.resource);
  }
}
