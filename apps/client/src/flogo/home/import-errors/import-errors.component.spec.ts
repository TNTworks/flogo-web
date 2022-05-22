import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ModalControl, MODAL_TOKEN } from '@flogo-web/lib-client/modal';
import { NoDependenciesFakeLanguageModule } from '@flogo-web/lib-client/language/testing';

import { ImportErrorsComponent } from './import-errors.component';
import { ImportErrorFormatterService } from '../core/import-error-formatter.service';

describe('ImportErrorsComponent', () => {
  let component: ImportErrorsComponent;
  let fixture: ComponentFixture<ImportErrorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      declarations: [ImportErrorsComponent],
      providers: [
        ImportErrorFormatterService,
        { provide: ModalControl, useValue: { close() {} } },
        { provide: MODAL_TOKEN, useValue: getMockData() },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should list 3 errors', () => {
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.qa-error'));
    expect(res.length).toEqual(3);
  });

  it('Should list the last error as an activity missing error', () => {
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('.flogo-error__list-container .flogo-error__content')
    );
    const el: HTMLElement = res[2].nativeElement;
    expect(el.innerHTML).toEqual('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT');
  });
});

function getMockData() {
  return [
    {
      keyword: 'type',
      dataPath: '.name',
      schemaPath: '#/properties/name/type',
      message: 'should be string',
      data: 3543252,
    },
    {
      keyword: 'type',
      dataPath: '.triggers',
      schemaPath: '#/properties/triggers/type',
      message: 'should be array',
      data: {},
    },
    {
      keyword: 'activity-installed',
      message: 'Activity "38756435643" is not installed',
      data: 38756435643,
      dataPath: '.resources[0].data.flow.rootTask.tasks[0].activityRef',
      schemaPath: '#/properties/activityRef/activity-installed',
      params: {
        ref: 'github.com/some/activity',
      },
    },
    {
      keyword: 'if',
      dataPath: '.resources[0].data.flow.rootTask.tasks[0]',
      schemaPath: '#/if',
      params: {
        failingKeyword: 'else',
      },
      message: 'should match "else" schema',
    },
  ];
}
