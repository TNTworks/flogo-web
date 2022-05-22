import { assign } from 'lodash';
import { of, pipe } from 'rxjs';
import { scan } from 'rxjs/operators';

import { AppResourceService } from './app-resource.service';
import { HandlersService } from './restapi/v2/handlers-api.service';
import { ResourceService } from './restapi/v2/resource.service';
import { TriggersService } from './restapi';
import { ContributionsService } from './restapi/v2/contributions.service';
import Spy = jasmine.Spy;

describe('Service: FlowsService', function(this: {
  testService: AppResourceService;
  mockHandlersAPIService: HandlersService;
  mockTriggersService: TriggersService;
  mockContribTriggerAPIService: ContributionsService;
  mockResourceAPIService: ResourceService;
}) {
  const mockAppTriggerData = {
    name: 'Receive HTTP Message',
    ref: 'some_path_to_repo/trigger/rest',
    description: 'Simple REST Trigger',
    settings: {
      port: null,
    },
    id: 'receive_http_message',
    createdAt: '2017-04-04T01:20:50.544Z',
    updatedAt: null,
    handlers: [
      {
        settings: {
          method: 'GET',
          path: null,
          autoIdReply: null,
          useReplyHandler: null,
        },
        actionId: 'my_new_app',
      },
      {
        settings: {
          method: null,
          path: null,
          autoIdReply: null,
          useReplyHandler: null,
        },
        actionId: 'app_with_trigger',
      },
    ],
    appId: 'some_app_id_1',
  };
  let spyDelete;
  let spyDeleteTrigger;
  beforeAll(() => {
    this.mockContribTriggerAPIService = jasmine.createSpyObj<ContributionsService>(
      'contribTriggersService',
      ['getContributionDetails']
    );
    this.mockResourceAPIService = jasmine.createSpyObj<ResourceService>(
      'resourceApiService',
      ['deleteResource']
    );
    this.mockTriggersService = jasmine.createSpyObj('triggersService', [
      'getTrigger',
      'deleteTrigger',
    ]);
    this.mockHandlersAPIService = jasmine.createSpyObj<HandlersService>(
      'handlersAPIService',
      ['updateHandler']
    );
    this.testService = new AppResourceService(
      this.mockHandlersAPIService,
      this.mockResourceAPIService,
      this.mockTriggersService,
      this.mockContribTriggerAPIService
    );
    spyDelete = <Spy>this.mockResourceAPIService.deleteResource;
    spyDelete.and.returnValue(of({ resourceDeleted: true }));
    spyDeleteTrigger = <Spy>this.mockTriggersService.deleteTrigger;
    spyDeleteTrigger.and.returnValue(Promise.resolve({}));
  });

  describe('When a flow is linked to a trigger', () => {
    const accumulateResults = () => pipe(scan<any>((acc, r) => [...acc, r], []));
    it('and the trigger is linked to other flows it should delete the flow but not the trigger', () => {
      const specTriggerData = assign({}, mockAppTriggerData);
      specTriggerData.handlers.pop();
      const spyGetTrigger = <Spy>this.mockTriggersService.getTrigger;
      spyGetTrigger.and.returnValue(Promise.resolve(specTriggerData));
      return this.testService
        .deleteResourceWithTrigger('some_flow_id_1', 'some_trigger_id_1')
        .pipe(accumulateResults())
        .toPromise()
        .then(results => {
          expect(results).toEqual([{ resourceDeleted: true }]);
        });
    });

    it('and the trigger is linked only to this flow it should delete both the flow and trigger', () => {
      const specTriggerData = assign({}, mockAppTriggerData);
      specTriggerData.handlers.pop();
      specTriggerData.handlers.pop();
      const spyGetTrigger = <Spy>this.mockTriggersService.getTrigger;
      spyGetTrigger.and.returnValue(Promise.resolve(specTriggerData));
      return this.testService
        .deleteResourceWithTrigger('some_flow_id_2', 'some_trigger_id_2')
        .pipe(accumulateResults())
        .toPromise()
        .then(results => {
          expect(results).toEqual([{ resourceDeleted: true }, { triggerDeleted: true }]);
        });
    });
  });
});
