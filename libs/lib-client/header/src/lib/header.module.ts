import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';

import { HeaderComponent } from './header.component';
import { BottomBlockDirective } from './bottom-block.directive';

@NgModule({
  declarations: [HeaderComponent, BottomBlockDirective],
  imports: [NgCommonModule, FlogoSharedModule],
  exports: [HeaderComponent, BottomBlockDirective],
})
export class HeaderModule {}
