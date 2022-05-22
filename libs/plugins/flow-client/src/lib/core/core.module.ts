import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunOrchestratorService } from './test-runner/run-orchestrator.service';
import { MicroServiceModelConverter } from './models/profiles/microservice-converter.model';
import { FlogoFlowService } from './flow.service';
import { IconProviderCreator } from './icon-provider-creator.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    RunOrchestratorService,
    MicroServiceModelConverter,
    FlogoFlowService,
    IconProviderCreator,
  ],
})
export class CoreModule {}
