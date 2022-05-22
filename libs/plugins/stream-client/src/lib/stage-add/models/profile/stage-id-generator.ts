import { calculateNextId } from './calculate-next-id';

export function stageIdGenerator(items?: any, currentStage?: any): string {
  let stageId = '';
  if (items) {
    if (currentStage) {
      stageId = currentStage.ref.split('/').pop() + '_';
    }
    stageId += calculateNextId(items, item => {
      return item.split('_').pop();
    });
  } else {
    // shift the timestamp for avoiding overflow 32 bit system
    // tslint:disable-next-line:no-bitwise
    stageId = '' + (Date.now() >>> 1);
  }
  return stageId;
}
