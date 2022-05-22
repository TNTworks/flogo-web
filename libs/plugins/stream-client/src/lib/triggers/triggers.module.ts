import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule as FlogoCoreModule } from '@flogo-web/lib-client/core';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { ContribInstallerModule } from '@flogo-web/lib-client/contrib-installer';
import {
  TriggerSharedModule,
  TriggerSelectorComponent,
} from '@flogo-web/lib-client/trigger-shared';

import { FlogoStreamTriggersPanelComponent } from './triggers.component';
import { ConfiguratorModule as TriggersConfiguratorModule } from './configurator';
import { TriggerBlockComponent } from './trigger-block';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoCoreModule,
    ContribInstallerModule,
    TriggersConfiguratorModule,
    TriggerSharedModule,
  ],
  declarations: [TriggerBlockComponent, FlogoStreamTriggersPanelComponent],
  exports: [FlogoStreamTriggersPanelComponent],
  entryComponents: [TriggerSelectorComponent],
})
export class TriggersModule {}
