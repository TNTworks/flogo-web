import { uniqueId } from 'lodash';

export function flogoGenTriggerID(): string {
  return `Flogo::Trigger::${Date.now()}`;
}

export function flogoGenNodeID() {
  return uniqueId(`FlogoFlowDiagramNode::${Date.now()}::`);
}
