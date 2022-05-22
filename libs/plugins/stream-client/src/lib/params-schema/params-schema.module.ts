import { NgModule } from '@angular/core';
import { SharedModule } from '@flogo-web/lib-client/common';

import { ParamsSchemaComponent } from './params-schema.component';
import { ButtonComponent } from './button/button.component';
import { ParamRowInputComponent } from './param-row-input/param-row-input.component';
import { ParamRowOutputComponent } from './param-row-output/param-row-output.component';
import { ModalModule } from '@flogo-web/lib-client/modal';

@NgModule({
  imports: [SharedModule, ModalModule],
  declarations: [
    ParamsSchemaComponent,
    ButtonComponent,

    // private to this module
    ParamRowInputComponent,
    ParamRowOutputComponent,
  ],
  exports: [ParamsSchemaComponent, ButtonComponent],
})
export class ParamsSchemaModule {}
