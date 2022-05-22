import { async, TestBed } from '@angular/core/testing';
import { HeaderModule as ClientHeaderModule } from './header.module';

describe('ClientHeaderModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientHeaderModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientHeaderModule).toBeDefined();
  });
});
