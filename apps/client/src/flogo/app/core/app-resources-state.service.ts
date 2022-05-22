import { sortBy } from 'lodash';
import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { Resource, Trigger } from '@flogo-web/core';
import { ResourcePluginManifest } from '@flogo-web/lib-client/core';

import { RESOURCE_PLUGINS_CONFIG } from '../../core';
import { ResourceWithPlugin } from './resource-with-plugin';
import { sortableName, resourceAndPluginMerger } from './support';

@Injectable()
export class AppResourcesStateService {
  private readonly _resources = new BehaviorSubject<Resource[]>([]);
  private readonly _triggers = new BehaviorSubject<Trigger[]>([]);

  public readonly resources$: Observable<ResourceWithPlugin[]>;
  public readonly triggers$: Observable<Trigger[]>;

  constructor(
    @Inject(RESOURCE_PLUGINS_CONFIG) resourcePlugins: ResourcePluginManifest[]
  ) {
    const mergeResourceWithPlugin = resourceAndPluginMerger(resourcePlugins);
    this.resources$ = this._resources.asObservable().pipe(
      map(resources => sortBy(resources, sortableName)),
      map(resources => resources.map(mergeResourceWithPlugin)),
      shareReplay(1)
    );

    this.triggers$ = this._triggers.asObservable().pipe(
      map(triggers => sortBy<Trigger>(triggers, sortableName)),
      shareReplay(1)
    );
  }

  public set triggers(triggers: Trigger[]) {
    this._triggers.next(triggers);
  }

  public get triggers() {
    return this._triggers.getValue();
  }

  public get resources() {
    return this._resources.getValue();
  }

  public set resources(resources: Resource[]) {
    this._resources.next(resources);
  }
}
