import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { MapperModule } from '@flogo-web/lib-client/mapper';

import { StageConfiguratorComponent } from './stage-configurator.component';
import { MapperTranslatorModule } from '../shared/mapper';

@NgModule({
  imports: [
    // module dependencies
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
    MapperTranslatorModule,
  ],
  declarations: [StageConfiguratorComponent],
  exports: [StageConfiguratorComponent],
  providers: [],
})
export class StageConfiguratorModule {}
