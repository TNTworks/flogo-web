import { Resource } from '@flogo-web/core';
import { RESOURCE_TYPE } from './constants';
import { StreamData } from '@flogo-web/plugins/stream-core';

export function isStreamResource(r: Partial<Resource>): r is Resource<StreamData> {
  return r && r.type === RESOURCE_TYPE;
}
