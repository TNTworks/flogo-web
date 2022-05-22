import { Resource } from '@flogo-web/core';
import { FlowState } from '../flow.state';

export function subflowSchemaUpdate(
  state: FlowState,
  payload: { newSubflowSchema?: Resource }
) {
  const { newSubflowSchema } = payload;
  if (!newSubflowSchema) {
    return state;
  }
  state = {
    ...state,
    linkedSubflows: {
      ...state.linkedSubflows,
      [newSubflowSchema.id]: { ...newSubflowSchema },
    },
  };
  return state;
}
