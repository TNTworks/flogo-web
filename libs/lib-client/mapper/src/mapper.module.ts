import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TreeModule } from 'primeng/components/tree/tree';

import { MonacoEditorModule } from '@flogo-web/editor';
import { MapperIconsModule } from '@flogo-web/lib-client/mapper-icons';

import { MappingParser } from './services/map.parser';
import { FunctionsComponent } from './functions-list/functions.component';

import { EditorComponent } from './editor/editor.component';
import { MapperComponent } from './mapper.component';
import { InputListComponent } from './input-list/input-list.component';
import { OutputListComponent } from './output-list/output-list.component';
import { FunctionDetailsComponent } from './functions-list/function-details.component';
import { TreeComponent } from './tree/tree.component';
import { ListComponent } from './list/list.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';

import { TreeNodeFactoryService } from './services/tree-node-factory.service';
import { TreeService } from './services/tree.service';
import { InlineHrefDirective } from './shared/inline-href.directive';
import { ClickOutsideDirective } from './shared/click-outside.directive';
import { ExpressionProcessorService } from './services/expression-processor.service';
import { MapperControllerFactory } from './services/mapper-controller';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([]),
    PerfectScrollbarModule,
    TreeModule,
    MonacoEditorModule,
    MapperIconsModule,
  ],
  exports: [FunctionsComponent, MapperComponent],
  declarations: [
    EditorComponent,
    FunctionsComponent,
    MapperComponent,
    InputListComponent,
    OutputListComponent,
    FunctionDetailsComponent,
    BreadcrumbsComponent,
    InlineHrefDirective,
    ClickOutsideDirective,
    TreeComponent,
    ListComponent,
  ],
  entryComponents: [MapperComponent],
  providers: [
    TreeNodeFactoryService,
    TreeService,
    ExpressionProcessorService,
    MappingParser,
    MapperControllerFactory,
  ],
  bootstrap: [],
})
export class MapperModule {}
