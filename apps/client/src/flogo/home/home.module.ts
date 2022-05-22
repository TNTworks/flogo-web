import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from '@flogo-web/lib-client/modal';
import { A11yModule } from '@angular/cdk/a11y';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';

import { FlogoAppsListComponent } from './apps-list/apps-list.component';
import { ImportErrorFormatterService } from './core/import-error-formatter.service';
import { FlogoHomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { ImportErrorsComponent } from './import-errors/import-errors.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlogoSharedModule,
    HomeRoutingModule,
    ModalModule,
    OverlayModule,
    A11yModule,
  ],
  declarations: [FlogoHomeComponent, FlogoAppsListComponent, ImportErrorsComponent],
  bootstrap: [FlogoHomeComponent],
  providers: [ImportErrorFormatterService],
  entryComponents: [ImportErrorsComponent],
  exports: [ImportErrorsComponent],
})
export class FlogoHomeModule {}
