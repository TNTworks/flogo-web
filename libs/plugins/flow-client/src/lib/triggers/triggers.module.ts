import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule as FlogoCoreModule } from '@flogo-web/lib-client/core';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import {
  TriggerSharedModule,
  TriggerSelectorComponent,
} from '@flogo-web/lib-client/trigger-shared';

import { CoreModule as FlowCoreModule } from '../core';
import { ContribInstallerModule } from '@flogo-web/lib-client/contrib-installer';
import { FlogoFlowTriggersPanelComponent } from './triggers.component';
import { TriggerBlockComponent } from './trigger-block';
import { ConfiguratorModule as TriggersConfiguratorModule } from './configurator';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoCoreModule,
    FlowCoreModule,
    TriggersConfiguratorModule,
    ContribInstallerModule,
    TriggerSharedModule,
  ],
  declarations: [TriggerBlockComponent, FlogoFlowTriggersPanelComponent],
  exports: [FlogoFlowTriggersPanelComponent],
  entryComponents: [TriggerSelectorComponent],
})
export class TriggersModule {}
