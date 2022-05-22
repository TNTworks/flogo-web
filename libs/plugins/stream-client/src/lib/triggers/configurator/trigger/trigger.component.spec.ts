import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigureTriggerComponent } from './trigger.component';
import { ConfiguratorModule } from '../configurator.module';
import { TriggersMock } from '../mocks/triggers.mock';

describe('ConfigureTriggerComponent component', () => {
  let component: ConfigureTriggerComponent;
  let fixture: ComponentFixture<ConfigureTriggerComponent>;
  let de: DebugElement;
  const MockData = {
    ...TriggersMock[0],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfiguratorModule],
    });
    fixture = TestBed.createComponent(ConfigureTriggerComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
  });

  it('Should be instantiated without any error', () => {
    expect(component).toBeDefined();
  });

  it('Should mark the trigger selected', () => {
    component.triggerData = MockData;
    component.selectedTriggerId = 'trigger_1';
    fixture.detectChanges();
    expect(component.isSelected).toEqual(true);
  });

  it('Should not mark the trigger selected', () => {
    component.triggerData = MockData;
    component.selectedTriggerId = 'trigger_2';
    fixture.detectChanges();
    expect(component.isSelected).toEqual(false);
  });
});
