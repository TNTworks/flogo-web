import { ItemSubflow } from '../../../interfaces/flow';

export const getLinkedSubflow = (t: ItemSubflow) => t.settings && t.settings.flowPath;
