import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamDiagramComponent } from './stream-diagram.component';

describe('StreamDiagramComponent', () => {
  let component: StreamDiagramComponent;
  let fixture: ComponentFixture<StreamDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StreamDiagramComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
