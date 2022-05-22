import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';

import { FlogoInstallerComponent } from './contrib-installer.component';
import { FlogoUrlInstallerComponent } from './url-installer/url-installer.component';

@NgModule({
  imports: [
    // module dependencies
    NgCommonModule,
    FormsModule,
    FlogoSharedModule,
  ],
  declarations: [FlogoUrlInstallerComponent, FlogoInstallerComponent],
  exports: [FlogoInstallerComponent],
  providers: [],
  entryComponents: [FlogoInstallerComponent],
})
export class ContribInstallerModule {}
