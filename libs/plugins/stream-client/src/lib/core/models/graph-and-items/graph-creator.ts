import {
  DiagramGraph,
  GraphNode,
  NodeType,
  NodeFeatures,
} from '@flogo-web/lib-client/core';

const defaultFeatures: NodeFeatures = {
  selectable: true,
  deletable: true,
  canHaveChildren: true,
  canBranch: false,
};

/* streams-plugin-todo: Add the streams backend interface */
export function makeGraphNodes(stages: any[]): DiagramGraph {
  const [rootStage] = stages;
  const nodes = stages.reduce((graphNodes, stage, index, allStages) => {
    const node = makeBasicNode(stage);
    if (index > 0) {
      node.parents = [allStages[index - 1].id];
    }
    if (allStages[index + 1]) {
      node.children = [allStages[index + 1].id];
    }
    graphNodes[node.id] = {
      ...node,
      children: node.children || [],
      parents: node.parents || [],
    };
    return graphNodes;
  }, {});
  return {
    rootId: rootStage ? rootStage.id : null,
    nodes,
  };
}

function makeBasicNode(stage): Partial<GraphNode> {
  return Object.assign(
    {},
    {
      type: NodeType.Task,
      id: stage.id,
      title: stage.name,
      description: stage.description,
      features: {
        ...defaultFeatures,
      },
    }
  );
}

export function makeNode(
  from: { id: string; type: NodeType } & Partial<GraphNode>
): Partial<GraphNode> {
  return {
    ...from,
    children: from.children ? [...from.children] : [],
    parents: from.parents ? [...from.parents] : [],
    features: { ...defaultFeatures, ...from.features },
  };
}
