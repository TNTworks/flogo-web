import { flatMap, map, defaults } from 'lodash';
import { Component, HostBinding, Inject } from '@angular/core';
import { CONTRIB_REFS, TriggerSchema } from '@flogo-web/core';
import { LanguageService } from '@flogo-web/lib-client/language';
import { MODAL_TOKEN, modalAnimate, ModalControl } from '@flogo-web/lib-client/modal';
import { ContributionsService, HttpUtilsService } from '@flogo-web/lib-client/core';

export interface ShimTriggerData {
  shimTriggersList: any[];
  buildOptions: any[];
}

@Component({
  selector: 'flogo-trigger-shim-build',
  templateUrl: 'shim-trigger.component.html',
  styleUrls: ['shim-trigger.component.less'],
  animations: modalAnimate,
})
export class TriggerShimBuildComponent {
  @HostBinding('@modalAnimate')
  displayOptions: any;
  isLambdaTrigger: boolean;
  isTriggerSelected: boolean;
  triggerSchema: TriggerSchema;

  get iconUrl() {
    if (this.triggerSchema?.icon) {
      return this.httpUtilsService.apiPrefix(this.triggerSchema.icon);
    }
    return null;
  }

  constructor(
    @Inject(MODAL_TOKEN) public shimTriggerData: ShimTriggerData,
    public control: ModalControl,
    public translate: LanguageService,
    private contribService: ContributionsService,
    private httpUtilsService: HttpUtilsService
  ) {
    const triggerRef = this.shimTriggerData.shimTriggersList[0].trigger.ref;
    this.contribService
      .getContributionDetails(triggerRef)
      .then((triggerSchema: TriggerSchema) => {
        this.triggerSchema = triggerSchema;
      });

    this.shimTriggerData.shimTriggersList = flatMap(
      this.shimTriggerData.shimTriggersList,
      shimTriggerList =>
        map(shimTriggerList.flows, flow =>
          defaults(
            { configuredTrigger: shimTriggerList.trigger },
            { configuredFlow: flow }
          )
        )
    );
    if (this.shimTriggerData.shimTriggersList.length === 1) {
      this.displayOptions = {
        triggerName: this.shimTriggerData.shimTriggersList[0].configuredTrigger.name,
        triggerId: this.shimTriggerData.shimTriggersList[0].configuredTrigger.id,
        flowName: this.shimTriggerData.shimTriggersList[0].configuredFlow.name,
      };
      this.isTriggerSelected = true;
    } else {
      this.displayOptions = {};
      this.isTriggerSelected = false;
    }
    this.isLambdaTrigger = false;
  }

  onTriggerSelectionFinish(trigger) {
    if (trigger.configuredTrigger.ref === CONTRIB_REFS.LAMBDA) {
      this.isLambdaTrigger = true;
      this.control.close({ triggerId: trigger.configuredTrigger.id });
    } else {
      this.displayOptions = {
        triggerName: trigger.configuredTrigger.name,
        triggerId: trigger.configuredTrigger.id,
        flowName: trigger.configuredFlow.name,
      };
      this.isTriggerSelected = true;
      this.isLambdaTrigger = false;
    }
  }

  onBuildEnvSelection(env, triggerId) {
    this.control.close({
      triggerId: triggerId,
      env: { os: env.os, arch: env.arch },
    });
  }

  closeModal() {
    this.control.close();
  }
}
