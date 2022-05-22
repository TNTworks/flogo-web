import { ResourceHooks, ValidationError } from '@flogo-web/lib-server/core';
import { FlowData } from '@flogo-web/plugins/flow-core';
import { validateFlowData } from './validation';
import { isFlowResource } from './is-flow-resource';

export const resourceHooks: ResourceHooks = {
  before: {
    async create(context) {
      if (isFlowResource(context.resource)) {
        runValidation(context.resource.data);
      }
      return context;
    },
    async update(context) {
      if (isFlowResource(context.resource)) {
        runValidation(context.resource.data);
      }
      return context;
    },
  },
};

function runValidation(data: FlowData) {
  const errors = validateFlowData(data);
  if (errors) {
    throw new ValidationError('Flow data validation errors', errors);
  }
}
