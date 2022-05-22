import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlowComponent } from './flow.component';
import { FlowDataResolver } from './flow-data.resolver';

const flowRoutes: Routes = [
  {
    path: '',
    component: FlowComponent,
    resolve: {
      flowData: FlowDataResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(flowRoutes)],
  exports: [RouterModule],
})
export class FlowRoutingModule {}
