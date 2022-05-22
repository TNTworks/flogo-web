import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FlogoConfigComponent } from './config.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FlogoConfigComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ConfigRoutingModule {}
