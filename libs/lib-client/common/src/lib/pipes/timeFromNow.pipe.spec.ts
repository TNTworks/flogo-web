import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeFromNowPipe } from './time-from-now.pipe';

@Component({
  selector: 'flogo-test-container',
  template: `
    <span>{{ dateCreated | timeFromNow }}</span>
  `,
})
class ContainerComponent {
  public dateCreated: any;

  constructor() {
    this.dateCreated = new Date();
  }
}

describe('Pipe: timeFromNow', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let directiveHost: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeFromNowPipe, ContainerComponent],
    });
    fixture = TestBed.createComponent(ContainerComponent);
    directiveHost = fixture.debugElement.query(By.css('span'));
    fixture.detectChanges();
  });

  it('The newly created component should be a recent one', () => {
    expect(directiveHost.nativeElement.innerHTML).toEqual('less than a minute ago');
  });

  it('Should work with strings', () => {
    directiveHost.componentInstance.dateCreated = new Date().toISOString();
    fixture.detectChanges();
    expect(directiveHost.nativeElement.innerHTML).toEqual('less than a minute ago');
  });

  it('When date changes the text should update', () => {
    const container = fixture.componentInstance;
    const anHourAgo = new Date(container.dateCreated.getTime());
    anHourAgo.setHours(anHourAgo.getHours() - 1);
    container.dateCreated = anHourAgo;
    fixture.detectChanges();
    expect(directiveHost.nativeElement.innerHTML).toEqual('about 1 hour ago');
  });
});
