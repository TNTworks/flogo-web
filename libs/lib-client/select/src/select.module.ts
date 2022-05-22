import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { SelectComponent } from './select/select.component';
import { SelectPanelComponent } from './select-panel/select-panel.component';
import { SelectOptionComponent } from './select-option/select-option.component';

@NgModule({
  declarations: [SelectComponent, SelectPanelComponent, SelectOptionComponent],
  imports: [CommonModule, OverlayModule, PortalModule],
  exports: [SelectComponent, SelectOptionComponent],
})
export class SelectModule {}
