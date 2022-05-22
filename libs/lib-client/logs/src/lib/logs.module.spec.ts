import { async, TestBed } from '@angular/core/testing';
import { LogsModule as ClientLogsModule } from './logs.module';

describe('ClientLogsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientLogsModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientLogsModule).toBeDefined();
  });
});
