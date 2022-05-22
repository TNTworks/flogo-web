import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule } from '@flogo-web/lib-client/common';
import { FormBuilderModule as DynamicFormModule } from '../shared/dynamic-form';
import { FieldsComponent } from './fields/fields.component';
import { ErrorComponent } from './error/error.component';

import { DebugPanelComponent } from './debug-panel.component';
import { ActivityIconModule } from '@flogo-web/lib-client/activity-icon';
@NgModule({
  imports: [NgCommonModule, SharedModule, DynamicFormModule, ActivityIconModule],
  declarations: [FieldsComponent, ErrorComponent, DebugPanelComponent],
  exports: [DebugPanelComponent],
})
export class DebugPanelModule {}
