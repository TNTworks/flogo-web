import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContributionType, TriggerSchema } from '@flogo-web/core';
import { ModalControl, ModalModule, ModalService } from '@flogo-web/lib-client/modal';
import { SearchModule } from '@flogo-web/lib-client/search';
import {
  ContributionsService,
  HttpUtilsService,
  TriggersService,
} from '@flogo-web/lib-client/core';
import { TriggerSelectorComponent } from './trigger-selector.component';
import { FakeTranslatePipe } from '@flogo-web/lib-client/language/testing';

describe('TriggerSelectorComponent', () => {
  let component: TriggerSelectorComponent;
  let fixture: ComponentFixture<TriggerSelectorComponent>;
  let existingTriggers: TriggerSchema[];

  beforeEach(async(() => {
    existingTriggers = [];
    TestBed.configureTestingModule({
      declarations: [TriggerSelectorComponent, FakeTranslatePipe],
      imports: [ModalModule, SearchModule],
      providers: [
        {
          provide: ModalService,
          useValue: null,
        },
        {
          provide: ModalControl,
          useValue: {
            data: {
              appId: 'abc',
            },
          },
        },
        {
          provide: TriggersService,
          useValue: {
            listTriggersForApp(appId, filters?: { name?: string }): Promise<any> {
              return Promise.resolve(existingTriggers);
            },
          } as Partial<TriggersService>,
        },
        {
          provide: ContributionsService,
          useValue: {
            listContribs() {
              return Promise.resolve([]);
            },
          } as Partial<ContributionsService>,
        },
        HttpUtilsService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should not display existing triggers tab, if there are no  existing triggers', async(() => {
    fixture.detectChanges();
    return fixture.whenStable().then(() => {
      const existingTriggerTab = fixture.debugElement.query(
        By.css('.qa-existing-trigger-tab')
      );
      expect(existingTriggerTab).toBeFalsy();
    });
  }));

  it('should display existing triggers tab, if there are existing triggers', async(() => {
    existingTriggers = [
      {
        type: ContributionType.Trigger,
        name: 'test trigger',
        ref: 'github.com/test/trigger',
        version: 'v0.0.0',
      },
    ];
    fixture.detectChanges();
    return fixture.whenStable().then(() => {
      fixture.detectChanges();
      const existingTriggerTab = fixture.debugElement.query(
        By.css('.qa-existing-trigger-tab')
      );
      expect(existingTriggerTab).toBeTruthy();
    });
  }));
});
