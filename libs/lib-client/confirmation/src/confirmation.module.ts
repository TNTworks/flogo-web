import { NgModule } from '@angular/core';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { LanguageModule } from '@flogo-web/lib-client/language';
@NgModule({
  imports: [LanguageModule],
  exports: [ConfirmationModalComponent],
  declarations: [ConfirmationModalComponent],
  entryComponents: [ConfirmationModalComponent],
})
export class ConfirmationModule {}
