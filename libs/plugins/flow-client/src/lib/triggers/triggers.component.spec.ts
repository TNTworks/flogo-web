import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayModule } from '@angular/cdk/overlay';

import { App } from '@flogo-web/core';
import {
  TriggersService,
  HandlersService,
  HttpUtilsService,
  ContributionsService,
} from '@flogo-web/lib-client/core';
import { ConfirmationModalService } from '@flogo-web/lib-client/confirmation';
import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';

import {
  ContribInstallerModule,
  ContribInstallerService,
} from '@flogo-web/lib-client/contrib-installer';
import { ModalService } from '@flogo-web/lib-client/modal';
import { MicroServiceModelConverter } from '../core';
import { featureReducer, FlowState, Init, INITIAL_STATE } from '../core/state';
import { FlogoFlowTriggersPanelComponent } from './triggers.component';
import { TriggerBlockComponent } from './trigger-block';
import { ConfiguratorModule as TriggersConfiguratorModule } from './configurator';
import { MapperTranslatorModule } from '../shared/mapper/mapper-translator';

const TEST_STATE: FlowState = {
  ...INITIAL_STATE,
  id: 'abc',
  app: <App>(<any>{
    id: 'someId',
    name: 'name',
    description: '',
    type: 'microservice',
  }),
};

const TRIGGERS_HANDLERS = {
  triggers: {
    trigger1: {
      id: 'trigger1',
      name: 'Receive HTTP Message',
      ref: 'some_path_to_repo/trigger/rest',
      description: 'Simple REST Trigger',
      settings: {
        port: null,
      },
      createdAt: '',
      updatedAt: '',
      handlers: [
        {
          settings: {
            method: 'GET',
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          resourceId: 'abc',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
        {
          settings: {
            method: null,
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          resourceId: 'abc',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
      ],
    },
    trigger2: {
      id: 'trigger2',
      name: 'Timer',
      createdAt: '',
      updatedAt: '',
      ref: 'some_path_to_repo/trigger/timer',
      description: 'Simple Timer Trigger',
      settings: {
        port: null,
      },
      handlers: [
        {
          settings: {
            method: 'GET',
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          resourceId: 'abc',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
        {
          settings: {
            method: null,
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          resourceId: 'ghi',
          outputs: {},
          actionMappings: {
            input: [],
            output: [],
          },
        },
      ],
    },
  },
  handlers: {
    trigger1: {
      triggerId: 'trigger1',
      resourceId: 'abc',
      settings: {
        method: 'GET',
        path: null,
        autoIdReply: null,
        useReplyHandler: null,
      },
      outputs: {},
      actionMappings: {
        input: [],
        output: [],
      },
    },
    trigger2: {
      triggerId: 'trigger2',
      resourceId: 'ghi',
      settings: {
        method: null,
        path: null,
        autoIdReply: null,
        useReplyHandler: null,
      },
      outputs: {},
      actionMappings: {
        input: [],
        output: [],
      },
    },
  },
};

class MockActivityContribService {}

class MockTriggerServiceV2 {}

class MockHandlerService {}

class MockUIConverterService {}

class MockConfirmationModal {}

describe('Component: TriggersComponent', () => {
  let fixture: ComponentFixture<FlogoFlowTriggersPanelComponent>;
  let store: Store<FlowState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule,
        ContribInstallerModule,
        TriggersConfiguratorModule,
        OverlayModule,
        StoreModule.forRoot({
          flow: featureReducer,
        }),
        MapperTranslatorModule,
      ],
      declarations: [FlogoFlowTriggersPanelComponent, TriggerBlockComponent],
      providers: [
        {
          provide: ContributionsService,
          useClass: MockActivityContribService,
        },
        { provide: TriggersService, useClass: MockTriggerServiceV2 },
        { provide: HandlersService, useClass: MockHandlerService },
        { provide: MicroServiceModelConverter, useClass: MockUIConverterService },
        { provide: ConfirmationModalService, useClass: MockConfirmationModal },
        HttpUtilsService,
        {
          provide: ContribInstallerService,
          useValue: ContribInstallerService,
        },
        { provide: ModalService, useValue: { openModal() {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(FlogoFlowTriggersPanelComponent);
  });

  it('When zero triggers provided it should list zero triggers', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        triggers: {},
        handlers: {},
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('flogo-trigger-icon')
    );
    expect(res.length).toEqual(0);
  });

  it('If two triggers are provided it should list two triggers', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        ...TRIGGERS_HANDLERS,
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('flogo-trigger-icon')
    );
    expect(res.length).toEqual(2);
  });

  it('Should always show Add Trigger button for Microservice Profile', () => {
    store.dispatch(
      new Init({
        ...TEST_STATE,
        ...TRIGGERS_HANDLERS,
      })
    );
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('.flogo-icon-add')
    );
    expect(res.length).toEqual(1);
  });
});

import { Injectable } from '@angular/core';

@Injectable()
class FlogoProfileServiceMock {
  private triggers;

  constructor() {
    this.triggers = [
      {
        id: 'tibco-coap',
        name: 'tibco-coap',
        version: '0.0.1',
        title: 'Receive CoAP Message',
        description: 'Simple CoAP Trigger',
        homepage: '',
        ref: 'some_path_to_repo/trigger/coap',
        settings: [
          {
            name: 'port',
            type: 'integer',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'queryParams',
            type: 'params',
          },
          {
            name: 'payload',
            type: 'string',
          },
        ],
        handler: {
          settings: [
            {
              name: 'method',
              type: 'string',
              required: true,
              allowed: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
            {
              name: 'path',
              type: 'string',
              required: true,
            },
            {
              name: 'autoIdReply',
              type: 'boolean',
            },
          ],
        },
      },
      {
        id: 'tibco-mqtt',
        name: 'tibco-mqtt',
        version: '0.0.1',
        title: 'Receive MQTT Message',
        description: 'Simple MQTT Trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/mqtt',
        ref: 'some_path_to_repo/trigger/mqtt',
        settings: [
          {
            name: 'broker',
            type: 'string',
          },
          {
            name: 'id',
            type: 'string',
          },
          {
            name: 'user',
            type: 'string',
          },
          {
            name: 'password',
            type: 'string',
          },
          {
            name: 'store',
            type: 'string',
          },
          {
            name: 'topic',
            type: 'string',
          },
          {
            name: 'qos',
            type: 'number',
          },
          {
            name: 'cleansess',
            type: 'boolean',
          },
        ],
        outputs: [
          {
            name: 'message',
            type: 'string',
          },
        ],
        handler: {
          settings: [
            {
              name: 'topic',
              type: 'string',
            },
          ],
        },
      },
      {
        id: 'tibco-rest',
        name: 'tibco-rest',
        version: '0.0.1',
        title: 'Receive HTTP Message',
        description: 'Simple REST Trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/rest',
        ref: 'some_path_to_repo/trigger/rest',
        settings: [
          {
            name: 'port',
            type: 'integer',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'params',
            type: 'params',
          },
          {
            name: 'pathParams',
            type: 'params',
          },
          {
            name: 'queryParams',
            type: 'params',
          },
          {
            name: 'content',
            type: 'object',
          },
        ],
        handler: {
          settings: [
            {
              name: 'method',
              type: 'string',
              required: true,
              allowed: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
            {
              name: 'path',
              type: 'string',
              required: true,
            },
            {
              name: 'autoIdReply',
              type: 'boolean',
            },
            {
              name: 'useReplyHandler',
              type: 'boolean',
            },
          ],
        },
      },
      {
        id: 'tibco-timer',
        name: 'tibco-timer',
        version: '0.0.1',
        title: 'Timer',
        description: 'Simple Timer trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/timer',
        ref: 'some_path_to_repo/trigger/timer',
        settings: [],
        outputs: [
          {
            name: 'params',
            type: 'params',
          },
          {
            name: 'content',
            type: 'object',
          },
        ],
        handler: {
          settings: [
            {
              name: 'repeating',
              type: 'string',
            },
            {
              name: 'startDate',
              type: 'string',
            },
            {
              name: 'hours',
              type: 'string',
            },
            {
              name: 'minutes',
              type: 'string',
            },
            {
              name: 'seconds',
              type: 'string',
            },
          ],
        },
      },
    ];
  }

  getTriggers() {
    return Promise.resolve(this.triggers);
  }

  installTriggers(urls: string[]) {
    throw new Error('installTriggers not implemented');
  }
}
