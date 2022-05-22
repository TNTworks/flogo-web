import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { A11yModule } from '@angular/cdk/a11y';
import { PortalModule } from '@angular/cdk/portal';

import { MonacoEditorModule } from '@flogo-web/editor';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { TriggerSharedModule } from '@flogo-web/lib-client/trigger-shared';
import { MapperModule } from '@flogo-web/lib-client/mapper';

import { ConfiguratorService } from './services/configurator.service';
import { ConfiguratorComponent } from './configurator.component';
import { ConfigureTriggerComponent } from './trigger/trigger.component';
import {
  TriggerDetailComponent,
  TabsComponent,
  ConfigureSettingsComponent,
  ConfigureDetailsService,
  TriggerNameValidatorService,
  SettingsFormBuilder,
  AutoCompleteDirective,
  FieldValueAccesorDirective,
  FieldErrorComponent,
  AutoCompleteContentComponent,
  ActionButtonsComponent,
  SettingsHelpComponent,
  SettingsFormFieldComponent,
  ConfirmEditionComponent,
} from './trigger-detail';

@NgModule({
  imports: [
    NgCommonModule,
    ReactiveFormsModule,
    ScrollingModule,
    A11yModule,
    PortalModule,
    FlogoSharedModule,
    MapperModule,
    MonacoEditorModule,
    TriggerSharedModule,
  ],
  declarations: [
    TriggerDetailComponent,
    ConfiguratorComponent,
    ConfigureTriggerComponent,
    ConfigureSettingsComponent,
    TabsComponent,
    AutoCompleteDirective,
    FieldValueAccesorDirective,
    AutoCompleteContentComponent,
    ActionButtonsComponent,
    SettingsHelpComponent,
    SettingsFormFieldComponent,
    FieldErrorComponent,
    ConfirmEditionComponent,
  ],
  exports: [ConfiguratorComponent],
  providers: [
    ConfiguratorService,
    ConfigureDetailsService,
    SettingsFormBuilder,
    TriggerNameValidatorService,
  ],
  entryComponents: [AutoCompleteContentComponent, ConfirmEditionComponent],
})
export class ConfiguratorModule {}
