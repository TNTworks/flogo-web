import { FlogoAppModel } from '@flogo-web/core';

export interface ExportedResourceInfo {
  type: string;
  ref: string;
  resource: FlogoAppModel.Resource;
}
