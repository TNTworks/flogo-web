import {
  GraphNode,
  NodeFeatures,
  NodeStatus,
  NodeType,
  Dictionary,
} from '@flogo-web/lib-client/core';
import {
  isIterableTask,
  Task as BackendTask,
  Link as BackendLink,
} from '@flogo-web/plugins/flow-core';
import { isSubflowTask } from '../flow/is-subflow-task';
import { isBranchConfigured } from '../flow/is-branch-configured';
import { Item, ItemActivityTask } from '../../interfaces/flow';

const defaultFeatures: NodeFeatures = {
  selectable: true,
  canHaveChildren: true,
  canBranch: true,
  deletable: true,
  subflow: false,
  final: false,
};

const defaultStatus: NodeStatus = {
  invalid: false,
  executed: false,
  executionErrored: null,
  iterable: false,
};

export function makeTaskNodes(
  tasks: BackendTask[],
  items: Dictionary<Item>
): Dictionary<GraphNode> {
  return tasks.reduce((nodes, task) => {
    const node = makeTask(task, items[task.id]);
    nodes[node.id] = node;
    return nodes;
  }, {} as Dictionary<GraphNode>);
}

function makeTask(task: BackendTask, item: Item): GraphNode {
  const isFinal = (<ItemActivityTask>item).return;
  return makeNode({
    type: NodeType.Task,
    id: task.id,
    title: task.name,
    description: task.description,
    features: {
      selectable: true,
      deletable: true,
      canHaveChildren: !isFinal,
      subflow: isSubflowTask(item.type),
      final: isFinal,
    },
    status: {
      iterable: isIterableTask(item),
    },
  });
}

export function makeBranchNode(id: string, link: BackendLink): GraphNode {
  return makeNode({
    id,
    type: NodeType.Branch,
    parents: [link.from],
    children: [link.to],
    status: { isBranchConfigured: isBranchConfigured(link.value) },
  });
}

export function makeNode(
  from: { id: string; type: NodeType } & Partial<GraphNode>
): GraphNode {
  return {
    ...from,
    children: from.children ? [...from.children] : [],
    parents: from.parents ? [...from.parents] : [],
    features: { ...defaultFeatures, ...from.features },
    status: { ...defaultStatus, ...from.status },
  };
}
