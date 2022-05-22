import { TriggerState } from '@flogo-web/lib-client/trigger-shared';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';

export interface CurrentTriggerState extends TriggerState {
  streamMetadata: StreamMetadata;
}
