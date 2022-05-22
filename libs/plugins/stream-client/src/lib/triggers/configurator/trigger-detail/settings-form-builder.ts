import { isEmpty, isString, mapValues, isUndefined, isNull } from 'lodash';
import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AsyncValidatorFn,
} from '@angular/forms';
import { Dictionary } from '@flogo-web/lib-client/core';
import {
  SettingControlInfo,
  SettingControlGroup,
  TriggerInformation,
} from '../interfaces';
import { SettingValue } from './settings-value';

@Injectable()
export class SettingsFormBuilder {
  constructor(private ngFormBuilder: FormBuilder) {}

  build(
    settingsFields,
    settingControls: TriggerInformation['settingsControls'],
    disableCommonSettings: boolean,
    nameValidator: AsyncValidatorFn
  ) {
    const settingsFormGroup: Dictionary<FormControl | FormGroup> = {};

    settingsFormGroup.name = this.ngFormBuilder.control(
      {
        value: settingsFields.name.value || '',
        disabled: disableCommonSettings,
      },
      Validators.required,
      nameValidator
    );

    settingsFormGroup.description = this.ngFormBuilder.control({
      value: settingsFields.description.value || '',
      disabled: disableCommonSettings,
    });

    if (!isEmpty(settingsFields.triggerSettings)) {
      settingsFormGroup.triggerSettings = this.formGroupBySettings(
        settingsFields.triggerSettings,
        settingControls[SettingControlGroup.TRIGGER],
        disableCommonSettings
      );
    }

    if (!isEmpty(settingsFields.handlerSettings)) {
      settingsFormGroup.handlerSettings = this.formGroupBySettings(
        settingsFields.handlerSettings,
        settingControls[SettingControlGroup.HANDLER]
      );
    }

    return this.ngFormBuilder.group(settingsFormGroup);
  }

  private formGroupBySettings(
    settings,
    settingsInformation: Dictionary<SettingControlInfo>,
    disableControls: boolean = false
  ): FormGroup {
    return this.ngFormBuilder.group(
      mapValues(settings, (setting, settingName) =>
        this.makeFormControl(setting, settingsInformation[settingName], disableControls)
      )
    );
  }

  private makeFormControl(
    setting,
    settingInfo: SettingControlInfo,
    disableControls?: boolean
  ) {
    const value =
      !isNull(setting.value) && !isUndefined(setting.value) ? setting.value : '';
    const viewValue = isString(value) ? value : JSON.stringify(value, null, 2);
    return this.ngFormBuilder.control(
      {
        value: <SettingValue>{
          viewValue,
          parsedValue: value,
        },
        disabled: disableControls,
      },
      settingInfo.validations
    );
  }
}
