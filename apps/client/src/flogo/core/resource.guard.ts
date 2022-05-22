import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
} from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ResourceService, ActivatedResourceRoute } from '@flogo-web/lib-client/core';

@Injectable({ providedIn: 'root' })
export class ResourceGuard implements CanActivate {
  constructor(
    private resourceService: ResourceService,
    private activatedResourceRoute: ActivatedResourceRoute
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.activatedResourceRoute.clear();
    const resourceId = route.paramMap.get('resourceId');
    const targetResourceType = route.firstChild.routeConfig.path;
    return this.resourceService.getResource(resourceId).pipe(
      map(resource => {
        if (resource.type !== targetResourceType) {
          return false;
        }
        this.activatedResourceRoute.configure(resourceId, resource);
        return true;
      }),
      catchError(error => {
        return of(false);
      })
    );
  }
}
