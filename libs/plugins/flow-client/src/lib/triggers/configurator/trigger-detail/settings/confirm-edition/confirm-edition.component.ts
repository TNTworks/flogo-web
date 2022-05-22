import { Component, Inject, InjectionToken } from '@angular/core';
import {
  ConfirmationContent,
  ConfirmationControl,
} from '@flogo-web/lib-client/confirmation';

export const EDITION_DATA_TOKEN = new InjectionToken(
  'flogo/triggers/configurator/confirm-settings-edition'
);

export interface EditionData {
  flowCount: number;
}

@Component({
  selector: 'flogo-confirm-edition',
  templateUrl: './confirm-edition.component.html',
  styleUrls: ['./confirm-edition.component.less'],
})
export class ConfirmEditionComponent implements ConfirmationContent {
  constructor(
    @Inject(EDITION_DATA_TOKEN) public data: EditionData,
    public control: ConfirmationControl
  ) {}
}
