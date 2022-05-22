import { Component, HostBinding, Inject, HostListener } from '@angular/core';

import { MODAL_TOKEN, modalAnimate, ModalControl } from '@flogo-web/lib-client/modal';

import { ValidationDetail } from '@flogo-web/lib-client/core';

import { ImportErrorFormatterService } from '../core/import-error-formatter.service';

@Component({
  selector: 'flogo-web-import-errors',
  templateUrl: './import-errors.component.html',
  styleUrls: ['./import-errors.component.less'],
  animations: modalAnimate,
})
export class ImportErrorsComponent {
  @HostBinding('@modalAnimate') animate = true;
  errorDetails: ValidationDetail[];

  constructor(
    public control: ModalControl,
    public errorFormatter: ImportErrorFormatterService,
    @Inject(MODAL_TOKEN) newErrorsData: any[]
  ) {
    this.errorDetails = this.errorFormatter.getErrorsDetails(newErrorsData);
  }

  @HostListener('document:keydown.escape')
  closeModal() {
    this.control.close();
  }
}
