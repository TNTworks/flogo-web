import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { TranslateModule } from '@ngx-translate/core';
import { ContribInstallerModule } from '@flogo-web/lib-client/contrib-installer';

import { AddStageDirective } from './add-stage.directive';
import { StageAddComponent } from './stage-add.component';
import { AddActivityService } from './add-activity.service';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityComponent } from './activity-list/activity.component';
import { ActivityIconModule } from '@flogo-web/lib-client/activity-icon';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    TranslateModule,
    ContribInstallerModule,
    ActivityIconModule,
  ],
  declarations: [
    AddStageDirective,
    StageAddComponent,
    ActivityComponent,
    ActivityListComponent,
  ],
  providers: [AddActivityService],
  entryComponents: [StageAddComponent],
  exports: [AddStageDirective],
})
export class StageAddModule {}
