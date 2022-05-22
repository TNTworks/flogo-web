import { async, TestBed } from '@angular/core/testing';

import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ResourceBadgeComponent } from './resource-badge.component';

@Component({
  selector: 'flogo-test-container',
  template: `
    <flogo-apps-resource-badge [type]="type" [color]="color"></flogo-apps-resource-badge>
  `,
})
class TestContainerComponent {
  type = 'example';
  color = 'rgb(255, 0, 0)';
}

describe('ResourceBadgeComponent', () => {
  let debugElement: DebugElement;
  let component: ResourceBadgeComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestContainerComponent, ResourceBadgeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    const parentFixture = TestBed.createComponent(TestContainerComponent);
    debugElement = parentFixture.debugElement.query(By.directive(ResourceBadgeComponent));
    component = debugElement.componentInstance;
    parentFixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the background color', () => {
    expect(debugElement.styles['background-color']).toEqual('rgb(255, 0, 0)');
  });

  it('should display the type initials as label', () => {
    expect(debugElement.nativeElement.innerText).toEqual('EX');
  });
});
