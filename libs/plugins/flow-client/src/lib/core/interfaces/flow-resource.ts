import { ApiResource, Resource } from '@flogo-web/core';
import { FlowData as ResourceFlowData } from '@flogo-web/plugins/flow-core';

export { ResourceFlowData };
export type FlowResource = Resource<ResourceFlowData>;
export type ApiFlowResource = ApiResource<ResourceFlowData>;
