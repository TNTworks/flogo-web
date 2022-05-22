import { async, TestBed } from '@angular/core/testing';
import { StreamClientModule } from './stream-client.module';

describe('StreamClientModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StreamClientModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(StreamClientModule).toBeDefined();
  });
});
