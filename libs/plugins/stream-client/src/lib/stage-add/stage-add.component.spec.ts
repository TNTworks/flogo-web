/*
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { CONTRIB_REFS } from '@flogo-web/core';
import { ContributionsService } from '@flogo-web/lib-client/core';
import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';

import { STAGEADD_OPTIONS, StageAddComponent } from './stage-add.component';
import { StageAddModule } from './stage-add.module';
import { StageAddOptions } from './core/stage-add-options';
import { ContribInstallerService } from '@flogo-web/lib-client/contrib-installer';
import { ModalService } from '@flogo-web/lib-client/modal';

describe('Component: StageAddComponent', () => {
  let component: StageAddComponent;
  let fixture: ComponentFixture<StageAddComponent>;
  const noOp = () => {};
  const mockOptions: StageAddOptions = {
    activities$: of([
      {
        ref: 'some_path_to_repo/activity/log',
        title: 'Log message',
      },
      {
        ref: 'some_path_to_repo/activity/counter',
        title: 'Counter',
      },
    ]),
    selectActivity: noOp,
    updateActiveState: noOp,
    cancel: noOp,
  };
  const mockContribsAPIService = {
    installContributions: () => Promise.resolve({}),
    getContributionDetails: () => Promise.resolve({}),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FakeRootLanguageModule, StageAddModule],
      providers: [
        {
          provide: STAGEADD_OPTIONS,
          useValue: mockOptions,
        },
        {
          provide: ContributionsService,
          useValue: mockContribsAPIService,
        },
        {
          provide: ContribInstallerService,
          useValue: ContribInstallerService,
        },
        {
          provide: ModalService,
          useValue: {
            openModal() {
              return { detach: of() };
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StageAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show 3 activities without filter', () => {
    const activitiesElements = fixture.debugElement.queryAll(By.css('.qa-activities'));
    expect(activitiesElements.length).toEqual(3);
  });

  it('should show 1 activity after filtering with "log"', () => {
    component.filterActivities('log');
    fixture.detectChanges();
    const activitiesElements = fixture.debugElement.queryAll(By.css('.qa-activities'));
    expect(activitiesElements.length).toEqual(1);
  });

  it('should show empty message if no activity with filtered text', () => {
    component.filterActivities('error');
    fixture.detectChanges();
    const activitiesElements = fixture.debugElement.queryAll(By.css('.qa-activities'));
    const messageElement = fixture.debugElement.query(By.css('.qa-no-tasks'));
    expect(activitiesElements.length).toEqual(0);
    expect(messageElement.nativeElement.innerHTML).toEqual('ADD:NO-TASKS');
  });

  it('should select the activity as a stage', () => {
    const spySelectActivity = spyOn(
      fixture.debugElement.injector.get(STAGEADD_OPTIONS),
      'selectActivity'
    );
    const activitiesElements = fixture.debugElement.queryAll(By.css('.qa-activities'));
    activitiesElements[1].triggerEventHandler('click', null);
    fixture.detectChanges();
    const [ref] = spySelectActivity.calls.mostRecent().args;
    expect(spySelectActivity).toHaveBeenCalledTimes(1);
    expect(ref).toEqual('some_path_to_repo/activity/counter');
  });

  it('should open installer and mark the popover to keep active', () => {
    const spyActiveState = spyOn(
      fixture.debugElement.injector.get(STAGEADD_OPTIONS),
      'updateActiveState'
    );
    const installElement = fixture.debugElement.query(By.css('.qa-install-item'));
    installElement.triggerEventHandler('click', null);
    fixture.detectChanges();
    const [state] = spyActiveState.calls.mostRecent().args;
    expect(spyActiveState).toHaveBeenCalledTimes(1);
    expect(component.isInstallOpen).toEqual(true);
    expect(state).toEqual(true);
  });
});
*/
