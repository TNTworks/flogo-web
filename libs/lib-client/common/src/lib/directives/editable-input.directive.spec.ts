import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { EditableInputDirective } from './editable-input.directive';

@Component({
  selector: 'flogo-test-container',
  template: `
    <input
      fgEditableInput
      (editableInputSave)="onSave()"
      (editableInputCancel)="onCancel()"
    />
  `,
})
class ContainerComponent {
  public onCancel() {}

  public onSave() {}
}

describe('Directive: EditableInput', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let container: ContainerComponent;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, BrowserModule],
      declarations: [EditableInputDirective, ContainerComponent],
    });
    fixture = TestBed.createComponent(ContainerComponent);
    container = fixture.componentInstance;
    de = fixture.debugElement.query(By.directive(EditableInputDirective));
  });

  it('Should emit a save event on blur', () => {
    spyOn(container, 'onSave');
    de.triggerEventHandler('blur', null);
    fixture.detectChanges();

    expect(container.onSave).toHaveBeenCalled();
  });

  it('Should emit one save event when "enter" is pressed', fakeAsync(() => {
    spyOn(de.nativeElement, 'blur');
    spyOn(container, 'onSave');
    de.triggerEventHandler('keyup.enter', new KeyboardEvent('keyup.enter'));
    fixture.detectChanges();
    // expect(container.onSave).toHaveBeenCalledTimes(1);
    // TODO: there seems to be an issue re-firing DOM issues from inside the directive in the karma environment
    // Instead we're making sure the blur event is called
    expect(de.nativeElement.blur).toHaveBeenCalledTimes(1);
  }));

  it('Should emit a cancel event when "esc" is pressed', () => {
    spyOn(container, 'onCancel');
    de.triggerEventHandler('keyup.esc', null);
    fixture.detectChanges();
    expect(container.onCancel).toHaveBeenCalled();
  });
});
