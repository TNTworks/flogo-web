import { NgModule } from '@angular/core';
import { ContextPanelAreaComponent } from './context-panel-area.component';
import { ToggleIconComponent } from './header-toggler/toggle-icon.component';
import { HeaderTogglerComponent } from './header-toggler/header-toggler.component';
import { TogglerRefService } from './toggler-ref.service';
import { CommonModule } from '@angular/common';
import { TriggerComponent } from './trigger/trigger.component';

@NgModule({
  imports: [CommonModule],
  exports: [ContextPanelAreaComponent, TriggerComponent],
  declarations: [
    ContextPanelAreaComponent,
    ToggleIconComponent,
    HeaderTogglerComponent,
    TriggerComponent,
  ],
  providers: [TogglerRefService],
})
export class ContextPanelModule {}
