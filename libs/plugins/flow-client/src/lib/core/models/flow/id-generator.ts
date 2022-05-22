import { uniqueId } from 'lodash';
import { BRANCH_PREFIX } from '@flogo-web/lib-client/diagram';

export function newBranchId() {
  return uniqueId(BRANCH_PREFIX);
}
