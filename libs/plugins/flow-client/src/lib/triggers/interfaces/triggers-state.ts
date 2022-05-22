import { FlowMetadata } from '../../core/interfaces/flow';
import { RenderableTrigger } from './renderable-trigger';

export interface TriggersState {
  appId: string;
  actionId: string;
  triggers: RenderableTrigger[];
  flowMetadata: FlowMetadata;
  currentTrigger: null | RenderableTrigger;
}
