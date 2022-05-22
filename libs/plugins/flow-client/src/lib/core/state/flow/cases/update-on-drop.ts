import { updateLinks } from '@flogo-web/lib-client/diagram';

import { FlowState } from '../flow.state';
import { getGraphName } from '../../utils';

export function updateLinksOnDrop(state: FlowState, { handlerType, itemId, parentId }) {
  const currentGraphName: string = getGraphName(handlerType);
  const currentGraph = state[currentGraphName];

  return {
    ...state,
    [currentGraphName]: updateLinks(currentGraph, itemId, parentId),
  };
}
