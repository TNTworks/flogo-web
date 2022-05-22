import { async, TestBed } from '@angular/core/testing';
import { FlowModule as PluginsFlowClientModule } from './flow.module';

describe('PluginsFlowClientModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PluginsFlowClientModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PluginsFlowClientModule).toBeDefined();
  });
});
