import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import {
  createDefaultRestApiHttpHeaders,
  DEFAULT_REST_HEADERS,
  HttpUtilsService,
  RestApiService,
  TriggersService,
} from './services/restapi';
import { HandlersService as RESTAPIHandlersServiceV2 } from './services/restapi/v2/handlers-api.service';
import { AppsService } from './services/restapi/v2/apps-api.service';
import { ConfigurationService } from './services/configuration.service';
import { ErrorService, WindowRef, SanitizeService, RunApiService } from './services';
import { ChildWindowService } from './services/child-window.service';
import { AppResourceService } from './services/app-resource.service';
import { ContributionsService } from './services/restapi/v2/contributions.service';
import { SvgRefFixerService } from './services/svg-ref-fixer.service';
import { LogService } from './services/log.service';
import { ShimTriggerBuildService } from './services/restapi/v2/shim-trigger-build.service';
import { FileDownloaderService } from './services/file-downloader.service';

@NgModule({
  imports: [HttpClientModule, RouterModule, TranslateModule],
  providers: [
    {
      provide: DEFAULT_REST_HEADERS,
      useValue: createDefaultRestApiHttpHeaders(),
    },
    HttpUtilsService,
    RestApiService,

    TriggersService,
    ShimTriggerBuildService,

    RESTAPIHandlersServiceV2,
    AppsService,
    ContributionsService,

    RunApiService,
    ChildWindowService,
    ErrorService,
    ConfigurationService,
    SanitizeService,
    WindowRef,
    AppResourceService,
    LogService,
    SvgRefFixerService,
    FileDownloaderService,
  ],
  declarations: [],
  exports: [],
  entryComponents: [],
})
export class CoreModule {}
