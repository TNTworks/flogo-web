import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonacoEditorComponent } from './monaco-editor.component';

@NgModule({
  imports: [CommonModule],
  exports: [MonacoEditorComponent],
  declarations: [MonacoEditorComponent],
})
export class MonacoEditorModule {}
