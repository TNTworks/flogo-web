import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityIconModule } from '@flogo-web/lib-client/activity-icon';
// todo: should this be loaded somewhere else?
import '@finos/perspective-viewer';
import '@finos/perspective-viewer-hypergrid';
import '@finos/perspective-viewer-d3fc';

import { SharedModule } from '@flogo-web/lib-client/common';
import { SimulatorComponent } from './simulator.component';
import { SimulatorVizComponent } from './simulator-viz.component';

@NgModule({
  declarations: [SimulatorComponent, SimulatorVizComponent],
  exports: [SimulatorComponent],
  imports: [CommonModule, SharedModule, ActivityIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SimulatorModule {}
