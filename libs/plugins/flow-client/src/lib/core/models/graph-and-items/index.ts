import { fromPairs } from 'lodash';

import { CONTRIB_REFS, ActivitySchema, ContributionSchema } from '@flogo-web/core';
import { Dictionary, FlowGraph, GraphNode } from '@flogo-web/lib-client/core';
import { Task as BackendTask, Link as BackendLink } from '@flogo-web/plugins/flow-core';

import { Item } from '../../interfaces';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE } from '../../constants';
import { makeTaskNodes, makeBranchNode } from './graph-creator';
import { makeBranchItem, makeTaskItems } from './items-creator';
import { isSubflowTask } from '../flow/is-subflow-task';

export type BranchIdGenerator = () => string;

export function makeGraphAndItems(
  tasks: BackendTask[],
  links: BackendLink[],
  contribSchemas: ContributionSchema[],
  getNewBranchId: BranchIdGenerator
): { items: Dictionary<Item>; graph: FlowGraph } {
  const getActivitySchema = activitySchemaFinder(contribSchemas);
  const taskItems = makeTaskItems(tasks, getActivitySchema);
  const taskNodes = makeTaskNodes(tasks, taskItems);

  const { nodes, items } = createAndAppendBranches(
    links,
    getNewBranchId,
    taskItems,
    taskNodes
  );
  const [rootTask] = tasks;
  return {
    items,
    graph: {
      rootId: rootTask ? rootTask.id : null,
      nodes,
    },
  };
}

function createAndAppendBranches(
  links: BackendLink[],
  getNewBranchId: BranchIdGenerator,
  items: Dictionary<Item>,
  nodes: Dictionary<GraphNode>
) {
  links.forEach(link => {
    const parentNode = nodes[link.from];
    const childNode = nodes[link.to];
    if (!parentNode || !childNode) {
      return;
    }
    const hasCondition = link.type === FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH;
    if (hasCondition) {
      const branchId = getNewBranchId();
      items[branchId] = makeBranchItem(branchId, link);
      nodes[branchId] = makeBranchNode(branchId, link);
      childNode.parents.push(branchId);
      parentNode.children.push(branchId);
    } else {
      childNode.parents.push(parentNode.id);
      parentNode.children.push(childNode.id);
    }
  });
  return { nodes, items };
}

function activitySchemaFinder(contribSchemas: ContributionSchema[]) {
  const schemaDictionary = fromPairs(contribSchemas.map(schema => [schema.ref, schema]));
  return (task: BackendTask): Partial<ActivitySchema> => {
    if (isSubflowTask(task.type)) {
      return { ref: CONTRIB_REFS.SUBFLOW };
    }
    return schemaDictionary[task.activityRef] as ActivitySchema;
  };
}
