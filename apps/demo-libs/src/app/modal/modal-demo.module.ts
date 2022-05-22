import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from '@flogo-web/lib-client/modal';
import {
  ModalParentComponent,
  DynamicSizeModalComponent,
} from './modal-parent.component';
import { ModalContentComponent } from './modal-content.component';

@NgModule({
  imports: [CommonModule, ModalModule],
  exports: [],
  declarations: [ModalParentComponent, ModalContentComponent, DynamicSizeModalComponent],
  providers: [],
  entryComponents: [ModalContentComponent, DynamicSizeModalComponent],
})
export class ModalDemoModule {}
