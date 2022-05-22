import { Component, OnInit } from '@angular/core';
import { ModalControl, ModalService } from '@flogo-web/lib-client/modal';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';
import {
  TriggersService,
  Trigger,
  ContributionsService,
  HttpUtilsService,
  FLOGO_CONTRIB_TYPE,
} from '@flogo-web/lib-client/core';
import { TriggerSchema } from '@flogo-web/core';
import { LocalSearch } from '@flogo-web/lib-client/search';
export interface TriggerMetaData {
  appId: string;
}

export interface TriggerSelectorResult {
  installType: 'existing' | 'installed';
  triggerSchema: TriggerSchema;
  trigger?: Trigger;
}

function sortByProperty<T>(property: keyof T) {
  return function(a, b) {
    return a[property].localeCompare(b[property]);
  };
}

@Component({
  selector: 'flogo-trigger-selector',
  templateUrl: './trigger-selector.component.html',
  styleUrls: ['./trigger-selector.component.less'],
})
export class TriggerSelectorComponent implements OnInit {
  showExistingTriggers = true;
  showExistingTriggersTab: boolean;
  existingTriggersSearcher: LocalSearch<Trigger>;
  installedTriggersSearcher: LocalSearch<TriggerSchema>;

  private installedTriggers: TriggerSchema[] = [];
  private appId: string;

  getTriggerIconUrl = ref => {
    const triggerSchema = this.installedTriggers.find(schema => {
      return schema.ref === ref;
    });
    const iconUrl = triggerSchema ? triggerSchema.icon : null;
    return iconUrl ? this.httpUtils.apiPrefix(iconUrl) : null;
  };

  constructor(
    private control: ModalControl<TriggerMetaData>,
    private modalService: ModalService,
    private triggerService: TriggersService,
    private contribService: ContributionsService,
    private httpUtils: HttpUtilsService
  ) {
    this.appId = this.control.data.appId;

    this.existingTriggersSearcher = new LocalSearch({ matchFields: ['name'] });

    this.installedTriggersSearcher = new LocalSearch({ matchFields: ['title'] });
  }

  ngOnInit() {
    this.getInstalledTriggers();
    this.getExistingTriggers();
  }

  displayExistingTriggers() {
    this.showExistingTriggers = true;
  }

  displayInstalledTriggers() {
    this.showExistingTriggers = false;
  }

  addExistingTriggerToApp(trigger, installType) {
    const triggerSchema = this.installedTriggers.find(schema => {
      return schema.ref === trigger.ref;
    });
    this.control.close({
      triggerSchema,
      installType,
      trigger,
    });
  }

  addNewTriggerToApp(triggerSchema, installType) {
    this.control.close({ triggerSchema, installType });
  }

  closeTriggerSelector() {
    this.control.close(null);
  }

  openInstallTriggerWindow() {
    this.modalService
      .openModal<void>(FlogoInstallerComponent)
      .result.subscribe(status => {
        if (status === 'success') {
          this.showExistingTriggers = false;
          this.getInstalledTriggers();
        }
      });
  }

  searchExistingTriggers(query: string) {
    this.existingTriggersSearcher.search(query);
  }

  searchInstalledTriggers(query: string) {
    this.installedTriggersSearcher.search(query);
  }

  private getInstalledTriggers() {
    this.contribService.listContribs(FLOGO_CONTRIB_TYPE.TRIGGER).then(triggers => {
      this.installedTriggers = triggers as TriggerSchema[];
      triggers = triggers.sort(sortByProperty<TriggerSchema>('title'));
      this.installedTriggersSearcher.setSourceList(triggers as TriggerSchema[]);
    });
  }

  private getExistingTriggers() {
    this.triggerService.listTriggersForApp(this.appId).then(existingTriggers => {
      const hasExistingTriggers = existingTriggers.length > 0;
      this.showExistingTriggersTab = hasExistingTriggers;
      this.showExistingTriggers = hasExistingTriggers;
      existingTriggers = existingTriggers.sort(sortByProperty('name'));
      this.existingTriggersSearcher.setSourceList(existingTriggers);
    });
  }
}
