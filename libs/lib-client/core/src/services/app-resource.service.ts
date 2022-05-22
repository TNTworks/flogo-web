import { Injectable } from '@angular/core';

import { Resource, TriggerSchema } from '@flogo-web/core';
import {
  TriggersService,
  HandlersService,
  ResourceService,
  ContributionsService,
} from './restapi';
import { concat, EMPTY, Observable, defer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

const mapSettingsArrayToObject = (settings: { name: string; value?: any }[]) =>
  (settings || []).reduce((all, c) => ({ ...all, [c.name]: c.value }), {});

@Injectable()
export class AppResourceService {
  constructor(
    private handlersService: HandlersService,
    private resourceService: ResourceService,
    private triggersService: TriggersService,
    private contribTriggerService: ContributionsService
  ) {}

  createResource(
    appId: string,
    newResource: { name: string; type: string; description?: string },
    triggerId
  ): Promise<{ resource: Resource; handler?: any }> {
    const createResource = () =>
      this.resourceService.createResource(appId, newResource).toPromise();
    if (!triggerId) {
      return createResource().then(resource => ({ resource }));
    }
    return createResource()
      .then(resource => {
        return this.getContribInfo(triggerId).then(contribTrigger => ({
          resource,
          contribTrigger,
        }));
      })
      .then(({ resource, contribTrigger }) => {
        const handlerSchema = contribTrigger.handler || ({} as TriggerSchema);
        const settings = mapSettingsArrayToObject(handlerSchema.settings);
        const outputs = mapSettingsArrayToObject(contribTrigger.outputs);
        return this.handlersService
          .updateHandler(triggerId, resource.id, {
            settings,
            outputs,
          })
          .then(handler => ({
            resource,
            handler,
          }));
      });
  }

  deleteResource(resourceId) {
    return this.resourceService.deleteResource(resourceId);
  }

  /**
   * Removes a resource and also removes the specified trigger if the trigger is the only trigger linked to that resource.
   * Will emit an event when the resource is deleted AND a separate event if the trigger is emitted.
   *
   * @example
   * `deleteResourceWithTrigger(resourceId, triggerId).subscribe((result) => console.log(result))`
   * will print:
   * { resourceDeleted: true }
   * { triggerDeleted: true }
   *
   * @param flowId
   * @param triggerId
   */
  deleteResourceWithTrigger(
    flowId: string,
    triggerId?: string
  ): Observable<{ resourceDeleted?: boolean } | { triggerDeleted?: boolean }> {
    const removeTriggerIfUnreferenced$ = triggerId
      ? removeTriggerIfUnreferenced(triggerId, this.triggersService).pipe(
          map(() => ({ triggerDeleted: true }))
        )
      : EMPTY;
    return concat(
      this.deleteResource(flowId).pipe(map(() => ({ resourceDeleted: true }))),
      removeTriggerIfUnreferenced$
    );
  }

  private getContribInfo(triggerInstanceId) {
    return this.triggersService
      .getTrigger(triggerInstanceId)
      .then(triggerInstance =>
        this.contribTriggerService.getContributionDetails<TriggerSchema>(
          triggerInstance.ref
        )
      );
  }
}

function removeTriggerIfUnreferenced(
  triggerId,
  triggersService: TriggersService
): Observable<never | { triggerDeleted?: boolean }> {
  // defer makes it a cold observable as triggerService.getTrigger is a promise
  return defer(() => triggersService.getTrigger(triggerId)).pipe(
    switchMap(triggerDetails =>
      triggerDetails.handlers && triggerDetails.handlers.length === 0
        ? triggersService.deleteTrigger(triggerDetails.id)
        : EMPTY
    ),
    map(() => ({ triggerDeleted: true }))
  );
}
