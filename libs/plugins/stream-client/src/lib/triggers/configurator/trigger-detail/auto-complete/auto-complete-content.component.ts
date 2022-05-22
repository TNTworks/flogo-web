import { Component, Inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AutocompleteOptions {
  filterTerm: Observable<string>;
  allowedValues: Observable<string[]>;
  appVariables: Observable<string[]>;
  onOptionSelected: (option) => void;
}

export const AUTOCOMPLETE_OPTIONS = new InjectionToken<AutocompleteOptions>(
  'flogo-triggers-configurator-settings-autocomplete-options'
);

@Component({
  selector: 'flogo-stream-triggers-configuration-settings-autocomplete',
  templateUrl: 'auto-complete-content.component.html',
  styleUrls: ['auto-complete-content.component.less'],
})
export class AutoCompleteContentComponent {
  constructor(@Inject(AUTOCOMPLETE_OPTIONS) public options: AutocompleteOptions) {}

  onOptionClicked(option) {
    this.options.onOptionSelected(option);
  }
}
