import { fromPairs } from 'lodash';
import { FormGroup } from '@angular/forms';
import { SettingControlGroup } from '../../interfaces';
import { convertSettingsFormValues } from './convert-setting-form-values';

export function extractTriggerChanges(form: FormGroup) {
  if (!form || !form.dirty) {
    return null;
  }
  const triggerChanges = [];
  const nameControl = form.get('name');
  if (nameControl && nameControl.dirty) {
    triggerChanges.push(['name', nameControl.value]);
  }
  const descriptionControl = form.get('description');
  if (descriptionControl && descriptionControl.dirty) {
    triggerChanges.push(['description', descriptionControl.value]);
  }
  const settingsControl = form.get(SettingControlGroup.TRIGGER) as FormGroup;
  if (settingsControl && settingsControl.dirty) {
    triggerChanges.push(['settings', convertSettingsFormValues(settingsControl)]);
  }
  return triggerChanges.length > 0 ? fromPairs(triggerChanges) : null;
}
