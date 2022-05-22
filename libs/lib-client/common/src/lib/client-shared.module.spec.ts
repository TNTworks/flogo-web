import { async, TestBed } from '@angular/core/testing';
import { SharedModule } from './client-shared.module';

describe('ClientSharedModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SharedModule).toBeDefined();
  });
});
