import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CopyToClipboardComponent } from './components';
import { TimeFromNowPipe, ObjectPropertiesPipe } from './pipes';
import {
  AutofocusDirective,
  ContenteditableDirective,
  DraggableDirective,
  EditableInputDirective,
  JsonDownloaderDirective,
  ClickOutsideDirective,
  ActionOnEscapeDirective,
} from './directives';
import { LoadingIndicatorComponent, FlogoDeletePopupComponent } from './components';

const ALL_MODULE_DECLARABLES = [
  CopyToClipboardComponent,
  ContenteditableDirective,
  JsonDownloaderDirective,
  LoadingIndicatorComponent,
  AutofocusDirective,
  DraggableDirective,
  EditableInputDirective,
  TimeFromNowPipe,
  ClickOutsideDirective,
  ActionOnEscapeDirective,
  FlogoDeletePopupComponent,
  ObjectPropertiesPipe,
];

@NgModule({
  // module dependencies
  imports: [NgCommonModule, TranslateModule],
  declarations: ALL_MODULE_DECLARABLES,
  exports: [
    NgCommonModule,
    // todo: should be in core only?
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ...ALL_MODULE_DECLARABLES,
  ],
})
export class SharedModule {}
