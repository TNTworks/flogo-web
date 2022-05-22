import { MapperState, MapperTreeNode } from '../../models';

const calculateIsOverallValid = (nodes: MapperTreeNode[]) =>
  nodes.every(node => !node.isInvalid);
const calculateIsOverallDirty = (nodes: MapperTreeNode[]) =>
  nodes.some(node => node.isDirty);

export function aggregateStatusChanges(
  state: MapperState,
  prevNode: MapperTreeNode,
  nextNode: MapperTreeNode
): MapperState {
  const newStatus = { isValid: state.isValid, isDirty: state.isDirty };
  const inputNodes = Object.values(state.inputs.nodes);
  if (prevNode.isInvalid !== nextNode.isInvalid) {
    newStatus.isValid = calculateIsOverallValid(inputNodes);
  }
  if (prevNode.isDirty !== nextNode.isDirty) {
    newStatus.isDirty = calculateIsOverallDirty(inputNodes);
  }
  if (newStatus.isDirty !== state.isDirty || newStatus.isValid !== state.isValid) {
    state = { ...state };
    state.isValid = newStatus.isValid;
    state.isDirty = newStatus.isDirty;
  }
  return state;
}
