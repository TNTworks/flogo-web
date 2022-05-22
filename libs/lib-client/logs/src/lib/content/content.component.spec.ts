import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { LogService } from '@flogo-web/lib-client/core';

import { SearchPipe } from '../search.pipe';
import { LogsContentComponent } from './content.component';

const LOG_LINES = [
  {
    message: 'message 1',
    timestamp: '7:53:17.574 Feb 20, 2017',
    level: 'error',
  },
  {
    message: 'message 2',
    timestamp: '7:53:17.575 Feb 20, 2017',
    level: 'warning',
  },
];

class LogServiceMocked {
  lines = [];
}

describe('Component: LogsContentComponent', () => {
  let comp: LogsContentComponent;
  let fixture: ComponentFixture<LogsContentComponent>;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [LogsContentComponent, SearchPipe],
      providers: [{ provide: LogService, useClass: LogServiceMocked }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(LogsContentComponent);
        comp = fixture.componentInstance;
        done();
      });
  });

  it('Should show two log lines', () => {
    comp.logService.lines = LOG_LINES;
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.log-line'));
    expect(res.length).toEqual(2);
  });

  it('Should filter log messages', () => {
    comp.logService.lines = LOG_LINES;
    comp.searchValue = 'message 1';
    fixture.detectChanges();
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.log-line'));
    expect(res.length).toEqual(1);
  });
});
