import { FlogoAppModel } from '@flogo-web/core';
import { ExportActionAgent } from '@flogo-web/lib-server/core';

export function createActionAgent(): ActionAgent {
  return new ActionAgent();
}

export class ActionAgent implements ExportActionAgent {
  private actionRegistry = new Map<string, FlogoAppModel.Action>();
  private count = 1;

  registerAction(ref: string, resourceId: string, settings) {
    const action = {
      id: `action_${this.count++}`,
      ref,
      settings,
    };
    this.actionRegistry.set(resourceId, action);
  }

  getActionId(resourceId: string): string | undefined {
    const action = this.actionRegistry.get(resourceId);
    return action ? action.id : undefined;
  }

  getAllActions(): FlogoAppModel.Action[] {
    return Array.from(this.actionRegistry.values());
  }
}
