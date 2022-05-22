import { NgModule } from '@angular/core';
import { SharedModule } from '@flogo-web/lib-client/common';

import { LogsComponent } from './logs.component';
import { SearchPipe } from './search.pipe';
import { LogsContentComponent } from './content/content.component';
import { ExternalWindowComponent } from './external-window/external-window.component';

@NgModule({
  imports: [
    // module dependencies
    SharedModule,
  ],
  declarations: [
    SearchPipe,
    LogsComponent,
    LogsContentComponent,
    ExternalWindowComponent,
  ],
  exports: [LogsComponent, ExternalWindowComponent],
})
export class LogsModule {}
