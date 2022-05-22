import { TriggerState } from '@flogo-web/lib-client/trigger-shared';
import { FlowMetadata } from '../../../core';

export interface CurrentTriggerState extends TriggerState {
  flowMetadata: FlowMetadata;
}
