import { FlogoAppModel } from '@flogo-web/core';
import {
  ImportActionsRegistry,
  parseResourceIdFromResourceUri,
} from '@flogo-web/lib-server/core';

type ApplicationAction = FlogoAppModel.Action;

export class FlogoActionExtractor implements ImportActionsRegistry {
  private actionIds: Map<string, ApplicationAction>;

  constructor(actions: ApplicationAction[] = []) {
    this.actionIds = new Map(actions.map(action => [action.id, action]));
  }

  getSettingsForId(actionId: string): ApplicationAction['settings'] {
    const actionForId = this.actionIds.get(actionId);
    return actionForId && actionForId.settings;
  }

  getSettingsForResourceId(
    resourceId: string,
    propertyName: string
  ): ApplicationAction['settings'] {
    const actionForResource = Array.from(this.actionIds.values()).find(action => {
      const settings = action.settings;
      const actionResourceId =
        settings && parseResourceIdFromResourceUri(settings[propertyName] || '');
      return actionResourceId === resourceId;
    });
    return actionForResource && actionForResource.settings;
  }

  getRefForId(actionId: string): string {
    const actionForId = this.actionIds.get(actionId);
    return actionForId && actionForId.ref;
  }
}
