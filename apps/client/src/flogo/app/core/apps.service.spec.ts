import { cold, getTestScheduler } from 'jasmine-marbles';
import { of } from 'rxjs';
import { AppDetailService } from './apps.service';
import { AppResourcesStateService } from './app-resources-state.service';
import { AppResourceService } from '@flogo-web/lib-client/core';
import { Trigger } from '@flogo-web/core';

describe('AppsService', () => {
  let resourceStateStub: Partial<AppResourcesStateService>;

  beforeEach(() => {
    resourceStateStub = {
      resources$: of([]),
      resources: [
        { id: 'resourceA', name: 'resource a', type: 'flow', data: null },
        { id: 'resourceB', name: 'resource b', type: 'flow', data: null },
      ],
      triggers: ([
        { id: 'trigger1', name: 'trigger 1' },
        { id: 'trigger2', name: 'trigger 2' },
      ] as Partial<Trigger>[]) as any[],
    };
  });

  function createAppService(
    resourceState: AppResourcesStateService,
    appResourceService: AppResourceService
  ): AppDetailService {
    return new AppDetailService(
      resourceState,
      null,
      null,
      null,
      null,
      appResourceService,
      null
    );
  }

  describe('When successfully removing the resource', () => {
    let appResourceServiceStub: Partial<AppResourceService>;
    let checkExpectedResourceState;
    beforeEach(() => {
      appResourceServiceStub = {
        deleteResourceWithTrigger() {
          return cold('-|');
        },
      };
      checkExpectedResourceState = () => {
        expect(resourceStateStub.resources.length).toEqual(1);
        expect(resourceStateStub.resources[0]).toEqual({
          id: 'resourceB',
          name: 'resource b',
          type: 'flow',
          data: null,
        });
        expect(resourceStateStub.triggers.length).toEqual(2);
      };
      const appService = createAppService(
        resourceStateStub as AppResourcesStateService,
        appResourceServiceStub as AppResourceService
      );
      appService.removeResource('resourceA', 'trigger1');
    });

    it('should remove the resource', () => {
      checkExpectedResourceState();
    });

    it('state should be maintained after completion', () => {
      getTestScheduler().flush();
      checkExpectedResourceState();
    });
  });

  it('Should re-add a resource if the update fails', () => {
    const appResourceServiceStub: Partial<AppResourceService> = {
      deleteResourceWithTrigger() {
        return cold('--#');
      },
    };
    const appService = createAppService(
      resourceStateStub as AppResourcesStateService,
      appResourceServiceStub as AppResourceService
    );
    appService.removeResource('resourceA', 'triggerId');
    expect(resourceStateStub.resources.length).toEqual(1);
    expect(resourceStateStub.resources[0]).toEqual({
      id: 'resourceB',
      name: 'resource b',
      type: 'flow',
      data: null,
    });

    getTestScheduler().flush();
    expect(resourceStateStub.resources.length).toEqual(2);
    expect(resourceStateStub.resources).toEqual(
      jasmine.arrayContaining([
        {
          id: 'resourceA',
          name: 'resource a',
          type: 'flow',
          data: null,
        },
      ])
    );
  });

  it('Should remove the trigger if indicated', () => {
    const appResourceServiceStub: Partial<AppResourceService> = {
      deleteResourceWithTrigger() {
        return cold('--t', {
          t: { triggerDeleted: true },
        });
      },
    };
    const appService = createAppService(
      resourceStateStub as AppResourcesStateService,
      appResourceServiceStub as AppResourceService
    );

    appService.removeResource('resourceA', 'trigger1');
    expect(resourceStateStub.triggers.length).toEqual(2);
    getTestScheduler().flush();
    expect(resourceStateStub.triggers.map(t => t.id)).toEqual(['trigger2']);
  });
});
