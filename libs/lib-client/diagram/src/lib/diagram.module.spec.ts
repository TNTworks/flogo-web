import { async, TestBed } from '@angular/core/testing';
import { DiagramModule } from './diagram.module';

describe('DiagramModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DiagramModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DiagramModule).toBeDefined();
  });
});
