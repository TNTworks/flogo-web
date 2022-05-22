import { ElementRef } from '@angular/core';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { ConfirmationService } from '@flogo-web/lib-client/confirmation';

import { ConfigureSettingsComponent } from './settings.component';
import { EDITION_DATA_TOKEN } from './confirm-edition/confirm-edition.component';

describe('Component: ConfigureSettingsComponent', function(this: {
  testComponent: ConfigureSettingsComponent;
  confirmationService: ConfirmationService;
}) {
  beforeEach(() => {
    this.confirmationService = jasmine.createSpyObj<ConfirmationService>(
      'confirmationService',
      ['openPopover']
    );
    this.testComponent = new ConfigureSettingsComponent(this.confirmationService);
    this.testComponent.triggerInformation = {
      settingsControls: null,
      trigger: {
        handlersCount: 3,
        readme: '',
        homePage: '',
      },
    };
  });

  it('Should open a confirmation popover when trying to enable settings', () => {
    const spyingObj = <Spy>this.confirmationService.openPopover;
    spyingObj.and.callFake(function() {
      expect(arguments[2].get(EDITION_DATA_TOKEN).streamCount).toEqual(3);
      return {
        result: of({}),
      };
    });
    this.testComponent.onEnableSettings(new ElementRef(document.createElement('input')));
    expect(this.confirmationService.openPopover).toHaveBeenCalled();
  });
});
