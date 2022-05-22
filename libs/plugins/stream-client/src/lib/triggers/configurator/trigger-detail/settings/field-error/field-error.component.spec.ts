import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FieldErrorComponent } from './field-error.component';

@Component({
  selector: 'flogo-stream-test-container',
  template: `
    <flogo-stream-configuration-settings-field-error
      #component
      [validationErrors]="errors"
    ></flogo-stream-configuration-settings-field-error>
  `,
})
class TestContainerComponent {
  @ViewChild('component', { static: false }) testComponent: FieldErrorComponent;
  errors: ValidationErrors | null;
}

describe('Component: FieldErrorComponent', () => {
  let fixture: ComponentFixture<TestContainerComponent>;
  let component: TestContainerComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestContainerComponent, FieldErrorComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestContainerComponent);
    component = fixture.componentInstance;
  }));

  it('Should have 2 errors to show', () => {
    component.errors = {
      required: true,
      syntaxError: {
        parsingErrors: [],
      },
    };
    fixture.detectChanges();
    expect(component.testComponent.errorMessages.length).toEqual(2);
    expect(fixture.debugElement.nativeElement.innerText).toEqual(
      'Property is required. Expression cannot be parsed, use $property[name] or $env[VAR_NAME].'
    );
  });

  it('Should show proper message for ErrorTypes.Required', () => {
    component.errors = {
      required: true,
    };
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('Property is required.');
  });

  it('Should show proper message for ErrorTypes.ValueNotAllowed', () => {
    component.errors = {
      notAllowed: {
        allowedValues: ['a', 'b', 'c'],
      },
    };
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toEqual(
      'Value not allowed, expected one of: a, b, c.'
    );
  });

  it('Should show proper message for ErrorTypes.SyntaxError', () => {
    component.errors = {
      syntaxError: {
        parsingErrors: [],
      },
    };
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toEqual(
      'Expression cannot be parsed, use $property[name] or $env[VAR_NAME].'
    );
  });

  it('Should show proper message for ErrorTypes.MissingResolvableProperty unknown resolver', () => {
    component.errors = {
      missingResolvableProperty: {
        resolverName: 'unknown',
      },
    };
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toEqual(
      'Missing property name for resolver "$unknown".'
    );
  });

  it('Should show proper message for ErrorTypes.MissingResolvableProperty env resolver', () => {
    component.errors = {
      missingResolvableProperty: {
        resolverName: 'env',
      },
    };
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toEqual(
      'Missing variable name, use: $env[VAR_NAME].'
    );
  });

  it('Should show proper message for ErrorTypes.MissingResolvableProperty property resolver', () => {
    component.errors = {
      missingResolvableProperty: {
        resolverName: 'property',
      },
    };
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.innerText).toEqual(
      'Missing property name, use: $property[propertyName].'
    );
  });
});
