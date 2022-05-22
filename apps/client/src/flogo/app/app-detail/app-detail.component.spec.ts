import { of, BehaviorSubject, EMPTY } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
  async,
  flush,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayModule } from '@angular/cdk/overlay';

import { App } from '@flogo-web/core';
import {
  CoreModule as FlogoCoreModule,
  SanitizeService,
} from '@flogo-web/lib-client/core';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { NotificationsServiceMock } from '@flogo-web/lib-client/notifications/testing';
import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';
import { ModalModule as FlogoModalModule } from '@flogo-web/lib-client/modal';
import { NotificationsService } from '@flogo-web/lib-client/notifications';

import { RESOURCE_PLUGINS_CONFIG } from '../../core';
import { AppDetailService } from '../core';
import { FlogoApplicationDetailComponent } from './app-detail.component';
import { FlogoExportFlowsComponent } from '../export-flows/export-flows.component';
import {
  ResourceComponent,
  ResourceListComponent,
  ResourcesGroupByTriggerComponent,
  ResourcesGroupByResourceComponent,
  ResourceBadgeComponent,
  ResourceViewsSelectorComponent,
} from '../resource-views';
import { NewResourceComponent } from '../new-resource/new-resource.component';
import { TriggerShimBuildComponent } from '../shim-trigger/shim-trigger.component';

interface IMockDetailService {
  app$: AppDetailService['app$'];
  load: AppDetailService['load'];
  updateProperty: AppDetailService['updateProperty'];
  getAvailableShimBuildOptions: AppDetailService['getAvailableShimBuildOptions'];
  getTriggersSchemas: AppDetailService['getTriggersSchemas'];
}

class MockAppDetailService implements IMockDetailService {
  appSource = new BehaviorSubject<App>(null);
  app$ = this.appSource.pipe(filter<App>(Boolean));
  actionEvent$ = EMPTY;

  load = (appId: string) => {};
  updateProperty = (prop: 'name' | 'description', value: any) => EMPTY;
  getAvailableShimBuildOptions = () => of([]);
  getTriggersSchemas = () => Promise.resolve([]);
}

describe('FlogoApplicationDetailComponent component', () => {
  let comp: FlogoApplicationDetailComponent;
  let fixture: ComponentFixture<FlogoApplicationDetailComponent>;
  let appDetailService: MockAppDetailService;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule,
        FlogoCoreModule,
        OverlayModule,
        FlogoSharedModule,
        FlogoModalModule,
      ],
      declarations: [
        ResourceComponent,
        ResourceListComponent,
        FlogoApplicationDetailComponent,
        ResourcesGroupByTriggerComponent,
        ResourcesGroupByResourceComponent,
        ResourceBadgeComponent,
        FlogoExportFlowsComponent,
        NewResourceComponent,
        TriggerShimBuildComponent,
        ResourceViewsSelectorComponent,
      ],
      providers: [
        { provide: AppDetailService, useClass: MockAppDetailService },
        { provide: SanitizeService, useValue: { sanitizeHTMLInput: v => v } },
        {
          provide: NotificationsService,
          useValue: new NotificationsServiceMock(),
        },
        {
          provide: RESOURCE_PLUGINS_CONFIG,
          useValue: [
            {
              label: 'Flow',
              type: 'flow',
              path: 'flow',
              loadChildren: () =>
                import('@flogo-web/plugins/flow-client').then(m => m.FlowModule),
              color: '#96a7f8',
            },
          ],
        },
      ],
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FlogoApplicationDetailComponent);
    comp = fixture.componentInstance;
    appDetailService = TestBed.get(AppDetailService) as MockAppDetailService;
    appDetailService.appSource.next(makeMockAppDetail());
    fixture.detectChanges();
    return fixture.whenStable();
  }));

  it('Should display the name correctly when the binding changes', async(() => {
    appDetailService.appSource.next({
      ...makeMockAppDetail(),
      id: '5',
      name: 'Sample Application 2',
    });
    fixture.detectChanges();
    const nameField = fixture.debugElement.query(By.css('.qa-name-label'));
    expect(nameField.nativeElement.innerText).toEqual('Sample Application 2');
  }));

  it('Should display creation date', fakeAsync(() => {
    appDetailService.appSource.next({
      ...makeMockAppDetail(),
      id: '5',
      name: 'Sample Application 2',
      createdAt: new Date().toISOString(),
    });
    flush();
    fixture.detectChanges();
    const creation = fixture.debugElement.query(By.css('.qa-creation-date'));
    expect(creation.nativeElement.innerText).toEqual('less than a minute ago.');
  }));

  it('Click on Add description should show description input field', fakeAsync(() => {
    let inputDescription;

    // because description field is empty, anchor add description should be present
    const addDescription = fixture.debugElement.query(
      By.css('.flogo-app-header__description-container > a')
    );
    expect(addDescription).toBeDefined();

    // input description should not be present
    inputDescription = fixture.debugElement.query(By.css('#appDescription'));
    expect(inputDescription).toBeNull();

    addDescription.nativeElement.click();
    fixture.detectChanges();
    flush();

    // after click on add description, input appDescription should be present
    inputDescription = fixture.debugElement.query(By.css('#appDescription'));
    expect(inputDescription).toBeDefined();
  }));

  it('When description field is empty, Add description link should be visible', () => {
    // because description field is empty, anchor add description should be present
    const addDescription = fixture.debugElement.query(By.css('.qa-add-description'));
    expect(addDescription).toBeDefined();
  });

  it('When done editing description input, description should be saved', fakeAsync(() => {
    const updateSpy = spyOn(appDetailService, 'updateProperty').and.callThrough();

    const addDescription = fixture.debugElement.query(By.css('.qa-add-description'));
    addDescription.nativeElement.click();
    tick();
    fixture.detectChanges();

    const newDescription = 'A brief description';
    const inputDescription = fixture.debugElement.query(By.css('#appDescription'));
    inputDescription.nativeElement.value = newDescription;
    inputDescription.nativeElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    inputDescription.triggerEventHandler('blur', null);
    tick();
    fixture.detectChanges();

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith('description', newDescription);
  }));

  it('When done editing name input, name should be saved', fakeAsync(() => {
    const updateSpy = spyOn(appDetailService, 'updateProperty').and.callThrough();
    appDetailService.appSource.next({
      ...appDetailService.appSource.getValue(),
      id: '5',
      updatedAt: new Date().toISOString(),
    });
    fixture.detectChanges();

    const labelApp = fixture.debugElement.query(By.css('.qa-name-label'));
    labelApp.nativeElement.click();
    fixture.detectChanges();

    const newName = 'A cool application';
    const nameInput = fixture.debugElement.query(By.css('#appName'));
    nameInput.nativeElement.value = newName;
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    nameInput.triggerEventHandler('blur', null);
    tick();
    fixture.detectChanges();

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith('name', newName);
  }));

  it('When the application has a description the add description link should not be visible', () => {
    appDetailService.appSource.next({
      ...appDetailService.appSource.getValue(),
      description: 'A brief description',
    });
    fixture.detectChanges();

    // because description field is not empty, anchor add description should not be present
    const addDescription = fixture.debugElement.query(By.css('.qa-add-description'));
    expect(addDescription).toBeNull();
  });

  it('If it is a new application, its name should be displayed as editable', async(() => {
    appDetailService.appSource.next({
      id: '5',
      name: 'Untitled Application',
      createdAt: new Date(),
      updatedAt: null,
    } as any);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const labelName = fixture.debugElement.query(By.css('.qa-name-label'));
      expect(labelName).toBeNull();

      const nameInput = fixture.debugElement.query(By.css('.qa-name-input'));
      expect(nameInput).not.toBeNull('Name input is not present');
    });
  }));

  it('If it is not a new application, its name should be displayed as a label', () => {
    const labelName = fixture.debugElement.query(By.css('.qa-name-label'));
    const labelElement = labelName.nativeElement;
    expect(labelElement.innerText).toEqual('Sample Application 1');
  });
});

function makeMockAppDetail(): App {
  return {
    id: '1',
    name: 'Sample Application 1',
    version: '0.0.1',
    description: null /* should be null for test */,
    type: 'flogo:app',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
