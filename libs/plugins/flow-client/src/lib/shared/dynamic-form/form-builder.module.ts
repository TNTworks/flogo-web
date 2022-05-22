import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@flogo-web/editor';
import { TextBoxComponent } from './textbox/textbox.component';
import { FormBuilderComponent } from './form-builder.component';
import { FormBuilderService } from './form-builder.service';
import { FormFieldService } from './form-field.service';
import { NumberComponent } from './number/number.component';
import { TextareaComponent } from './textarea/textarea.component';
import { RadioComponent } from './radio/radio.component';
import { ObjectTypeComponent } from './object/object-type.component';
import { DynamicFieldGroupComponent } from './dynamic-field-group.component';
import { FieldErrorComponent } from './field-error/field-error.component';
import { LabelComponent } from './label/label.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MonacoEditorModule],
  declarations: [
    FormBuilderComponent,
    TextBoxComponent,
    NumberComponent,
    TextareaComponent,
    RadioComponent,
    ObjectTypeComponent,
    DynamicFieldGroupComponent,
    FieldErrorComponent,
    LabelComponent,
  ],
  providers: [FormBuilderService, FormFieldService],
  exports: [FormBuilderComponent, DynamicFieldGroupComponent],
})
export class FormBuilderModule {}
