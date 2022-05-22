import { of } from 'rxjs';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import {
  CoreModule as FlogoCoreModule,
  ResourceService,
} from '@flogo-web/lib-client/core';
import { MODAL_TOKEN, ModalControl } from '@flogo-web/lib-client/modal';
import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';

import { RESOURCE_PLUGINS_CONFIG } from '../../core';
import { NewResourceComponent, NewResourceData } from './new-resource.component';

const EXISTING_FLOW_NAME = 'existing';
const resourceServiceStub: {
  listResourcesWithName: ResourceService['listResourcesWithName'];
} = {
  listResourcesWithName(name: string) {
    let resourceArr = [];
    if (name === EXISTING_FLOW_NAME) {
      resourceArr = [{ id: '123', name: EXISTING_FLOW_NAME }];
    }
    return of(resourceArr);
  },
};

const newFlowDataStub: NewResourceData = {
  appId: 'app1',
  triggerId: 'trigger1',
};

const modalControlStub = {
  close() {
    return {};
  },
};

describe('Component: app/NewResourceComponent', () => {
  let component: NewResourceComponent;
  let fixture: ComponentFixture<NewResourceComponent>;
  let elements: {
    submitBtn: DebugElement;
    nameInput: DebugElement;
    descriptionInput: DebugElement;
  };

  let submitBtn: DebugElement;

  const testFlow = {
    name: 'new resource name',
    description: 'new resource description',
    type: 'someType',
  };

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [FakeRootLanguageModule, FlogoCoreModule, FlogoSharedModule],
      declarations: [NewResourceComponent], // declare the test component
      providers: [
        { provide: ResourceService, useValue: resourceServiceStub },
        { provide: ModalControl, useValue: modalControlStub },
        { provide: MODAL_TOKEN, useValue: newFlowDataStub },
        {
          provide: RESOURCE_PLUGINS_CONFIG,
          useValue: [
            {
              label: 'Some resource type',
              type: 'someType',
              path: 'someresource',
              loadChildren: () => null,
              color: '#96a7f8',
            },
            {
              label: 'Another resource type',
              type: 'anotherType',
              path: 'anotherType',
              loadChildren: () => null,
              color: '#96a7f8',
            },
          ],
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewResourceComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    spyOn(component.control, 'close');

    elements = {
      submitBtn: fixture.debugElement.query(By.css('[type="submit"]')),
      nameInput: fixture.debugElement.query(By.css('#resourceName')),
      descriptionInput: fixture.debugElement.query(By.css('#resourceDescription')),
    };

    submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
  });

  afterEach(() => {
    return component.closeAddFlowModal();
  });

  it('Should not allow save when resource name is not provided', async(() => {
    fixture.detectChanges();
    expect(component.resource.valid).toBe(false, 'form is valid');
    expect(submitBtn.nativeElement.disabled).toBe(true);
  }));

  it('Should not allow to save when resource name already exists', async(() => {
    setValueAndDispatch(EXISTING_FLOW_NAME, elements.nameInput);
    fixture.detectChanges();
    expect(component.resource.valid).toBe(false, 'form is valid');
    expect(submitBtn.nativeElement.disabled).toBeTruthy();
  }));

  it('Should trigger an event with the resource info when the save button is clicked', async(() => {
    setNameAndDescriptionAndAssertState()
      .then(() => {
        submitBtn.nativeElement.click();
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        assertSavedResource(testFlow);
      });
  }));

  it('Should send the selected resource type along the resource data', async(() => {
    setNameAndDescriptionAndAssertState()
      .then(() => {
        const resourceTypeOptionEl = fixture.debugElement.query(
          By.css('#resource-type-anotherType')
        );
        resourceTypeOptionEl.nativeElement.click();
        submitBtn.nativeElement.click();
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        assertSavedResource({ ...testFlow, type: 'anotherType' });
      });
  }));

  function assertSavedResource(expectedResource: { name; description; type }) {
    const [mostRecentCallParams] = (<jasmine.Spy>(
      component.control.close
    )).calls.mostRecent().args;
    const { name, description, type } = mostRecentCallParams;
    expect(component.control.close).toHaveBeenCalledTimes(1);
    expect({ name, description, type }).toEqual(expectedResource);
  }

  function setValueAndDispatch(value: any, de: DebugElement) {
    const nativeElement = de.nativeElement;
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  }

  function setNameAndDescriptionAndAssertState() {
    setValueAndDispatch(testFlow.name, elements.nameInput);
    fixture.detectChanges();

    return fixture
      .whenStable()
      .then(() => {
        setValueAndDispatch(testFlow.description, elements.descriptionInput);
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        expect(component.resource.valid).toBe(true, 'form is invalid');
        expect(submitBtn.nativeElement.disabled).toBeFalsy(
          'Submit button is not enabled'
        );
      });
  }
});
