import {
  difference,
  cloneDeep,
  get,
  each,
  includes,
  isEmpty,
  isNumber,
  isString,
  isUndefined,
} from 'lodash';

import { ActivitySchema, ValueType } from '@flogo-web/core';
import {
  getDefaultValue,
  flowToJSON_Attribute,
  flowToJSON_Link,
  flowToJSON_Mapping,
  flowToJSON_Task,
  Dictionary,
  FlowGraph,
  GraphNode,
  NodeType,
} from '@flogo-web/lib-client/core';
import {
  FlowResource,
  ResourceFlowData,
  TaskAttribute as DiagramTaskAttribute,
  AttributeMapping as DiagramTaskAttributeMapping,
  FlowMetadata,
  Item,
  MetadataAttribute,
  UiFlow,
  ItemActivityTask,
  ItemBranch,
  ItemTask,
} from '../../interfaces';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE, FLOGO_TASK_TYPE } from '../../constants';
import { isSubflowTask } from '../flow/is-subflow-task';
import { mergeItemWithSchema } from '../merge-item-with-schema';

const DEBUG = false;
const INFO = true;

const generateDiagramTraverser = schemas => {
  const visited: string[] = [];
  const tasksDest: flowToJSON_Task[] = [];
  const linksDest: flowToJSON_Link[] = [];
  let idCounter = 0;
  const _genLinkId = () => ++idCounter;

  function _traversalDiagramChildren(
    node: GraphNode,
    nodes: Dictionary<GraphNode>,
    tasks: Dictionary<Item>
  ) {
    // if haven't visited
    if (!includes(visited, node.id)) {
      visited.push(node.id);

      const nodesToGo = difference(node.children, visited);

      each(nodesToGo, nid => {
        const childNode = nodes[nid];

        // handle branch node differently
        if (childNode.type === NodeType.Branch) {
          const branch = tasks[childNode.id];

          // single child is found
          //  since branch can has only one direct child, this is the only case to follow
          if (branch && childNode.children.length === 1) {
            /* tslint:disable-next-line:no-unused-expression */
            DEBUG && console.log('Found a branch with activity!');

            // traversal its children
            _traversalDiagramChildren(childNode, nodes, tasks);
          } else {
            /* tslint:disable-next-line:no-unused-expression */
            DEBUG && console.warn("- Found a branch!\n- Don't care..");
          }

          return;
        }

        /*
         * add task
         */

        const taskInfo = _prepareTaskInfo(<ItemActivityTask>tasks[childNode.id]);
        if (!isEmpty(taskInfo)) {
          tasksDest.push(taskInfo);
        }

        /*
         * add link
         */

        if (node.type === NodeType.Task) {
          linksDest.push({
            id: _genLinkId(),
            from: node.id,
            to: childNode.id,
            type: FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.DEFAULT,
          });
        } else if (node.type === NodeType.Branch && node.parents.length === 1) {
          const parentNode = nodes[node.parents[0]];
          const branch = tasks[node.id] as ItemBranch;

          linksDest.push({
            id: _genLinkId(),
            from: parentNode.id,
            to: childNode.id,
            type: FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE.BRANCH,
            value: branch.condition,
          });
        }

        _traversalDiagramChildren(childNode, nodes, tasks);
      });
    }
  }

  function _prepareTaskInfo(item: ItemTask) {
    // todo: remove schema === {} for subflow case
    const schema = <ActivitySchema>schemas[item.ref] || <any>{};
    const task = mergeItemWithSchema(item, schema);
    const taskInfo = <flowToJSON_Task>{};
    if (_isValidInternalTaskInfo(task)) {
      taskInfo.id = task.id;
      taskInfo.name = get(task, 'name', '');
      taskInfo.description = get(task, 'description', '');
      taskInfo.type = task.type;
      taskInfo.activityType = task.activityType || '';
      if (!isSubflowTask(task.type)) {
        taskInfo.activityRef = task.ref;
      }

      taskInfo.attributes = _parseFlowAttributes(
        <DiagramTaskAttribute[]>get(task, 'attributes.inputs')
      );

      /* add inputMappings */

      const inputMappings = get(task, 'inputMappings', {});
      const activitySettings = get(task, 'activitySettings', {});

      if (!isEmpty(inputMappings)) {
        taskInfo.inputMappings = inputMappings;
      }
      if (!isEmpty(activitySettings)) {
        taskInfo.activitySettings = activitySettings;
      }
      /* add outputMappings */

      const outputMappings = parseFlowMappings(
        <DiagramTaskAttributeMapping[]>get(task, 'outputMappings')
      );

      if (!isEmpty(outputMappings)) {
        taskInfo.ouputMappings = outputMappings;
      }

      if (!isEmpty(task.settings)) {
        taskInfo.settings = cloneDeep(task.settings);
      }
    } else {
      /* tslint:disable-next-line:no-unused-expression */
      INFO && console.warn('Invalid task found.');
      /* tslint:disable-next-line:no-unused-expression */
      INFO && console.warn(task);
    }
    return taskInfo;
  }

  return (rootNode: GraphNode, nodes: Dictionary<GraphNode>, tasks: Dictionary<Item>) => {
    const rootTaskInfo = _prepareTaskInfo(<ItemActivityTask>tasks[rootNode.id]);
    if (!isEmpty(rootTaskInfo)) {
      tasksDest.push(rootTaskInfo);
    }
    _traversalDiagramChildren(rootNode, nodes, tasks);
    return { tasks: tasksDest, links: linksDest };
  };
};

function _isValidInternalTaskInfo(task: {
  id: string;
  type: FLOGO_TASK_TYPE;
  activityType?: string;
  ref?: string;
  [key: string]: any;
}): boolean {
  if (isEmpty(task)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.warn('Empty task');
    return false;
  }

  if (!task.id) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.warn('Empty task id');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(task);
    return false;
  }

  if (!isNumber(task.type)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.warn('Invalid task type');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(task);
    return false;
  }

  if (isEmpty(task.ref)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.warn('Empty task activityType');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(task);
    return false;
  }

  return true;
}

function _parseFlowAttributes(inAttrs: any[]): flowToJSON_Attribute[] {
  const attributes = <flowToJSON_Attribute[]>[];

  each(inAttrs, (inAttr: any) => {
    const attr = <flowToJSON_Attribute>{};

    /* simple validation */
    attr.name = <string>get(inAttr, 'name');
    attr.value = <any>get(inAttr, 'value', getDefaultValue(inAttr.type));
    attr.required = !!inAttr.required;

    if (isEmpty(attr.name)) {
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.warn('Empty attribute name found');
      /* tslint:disable-next-line:no-unused-expression */
      DEBUG && console.log(inAttr);
      return;
    }

    // the attribute default attribute type is STRING
    attr.type = inAttr.type || ValueType.String;

    attributes.push(attr);
  });

  return attributes;
}

/**
 * Convert the action to server model
 */
export function savableFlow(inFlow: UiFlow): FlowResource {
  if (!inFlow || isEmpty(inFlow.id)) {
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.error('No id in the given flow');
    /* tslint:disable-next-line:no-unused-expression */
    DEBUG && console.log(inFlow);
    return {} as FlowResource;
  }

  const resource: FlowResource = {
    id: inFlow.id,
    type: 'flow',
    name: inFlow.name || '',
    description: inFlow.description || '',
    metadata: _parseMetadata(
      inFlow.metadata || {
        input: [],
        output: [],
      }
    ),
    data: {} as ResourceFlowData,
  };

  const mainHandler = buildHandler(inFlow.mainGraph, inFlow.mainItems, inFlow);
  if (mainHandler) {
    resource.data.tasks = mainHandler.tasks as ResourceFlowData['tasks'];
    resource.data.links = mainHandler.links;
  }

  const errorHandler = buildHandler(inFlow.errorGraph, inFlow.errorItems, inFlow);
  if (errorHandler) {
    resource.data.errorHandler = {
      tasks: errorHandler.tasks as ResourceFlowData['errorHandler']['tasks'],
      links: errorHandler.links,
    };
  }

  return resource;
}

function buildHandler(graph: FlowGraph, flowItems: Dictionary<Item>, inFlow: UiFlow) {
  const flowPathRoot = graph.rootId;
  const flowPathNodes = graph.nodes;
  const isHandlerEmpty = isEmpty(graph) || !flowPathRoot || isEmpty(flowPathNodes);
  if (!isHandlerEmpty && !isEmpty(flowItems)) {
    const rootNode = flowPathNodes[flowPathRoot];
    if (!isEmpty(rootNode)) {
      const _traversalDiagram = generateDiagramTraverser(inFlow.schemas);
      return _traversalDiagram(rootNode, flowPathNodes, flowItems);
    }
  }
  return null;
}

function _parseMetadata(metadata: FlowMetadata): FlowMetadata {
  const flowMetadata: FlowMetadata = {
    input: [],
    output: [],
  };
  flowMetadata.input = metadata.input.map(input => {
    const inputMetadata: MetadataAttribute = {
      name: input.name,
      type: input.type || ValueType.String,
    };
    if (!isUndefined(input.value)) {
      inputMetadata.value = input.value;
    }
    return inputMetadata;
  });
  flowMetadata.output = metadata.output.map(output => ({
    name: output.name,
    type: output.type || ValueType.String,
  }));
  return flowMetadata;
}

export function parseFlowMappings(inMappings: any[] = []): flowToJSON_Mapping[] {
  return inMappings.reduce((parsedMappings: flowToJSON_Mapping[], inMapping: any) => {
    if (!isValidMapping(inMapping)) {
      return parsedMappings;
    }
    const parsedMapping: flowToJSON_Mapping = {
      type: inMapping.type,
      value: inMapping.value,
      mapTo: inMapping.mapTo,
    };
    if (!isNumber(parsedMapping.type)) {
      console.warn('Force invalid mapping type to 1 since it is not a number.');
      console.log(parsedMapping);
      parsedMapping.type = 1;
    }
    parsedMappings.push(parsedMapping);
    return parsedMappings;
  }, []);

  /* simple validation */
  function isValidMapping(mapping) {
    if (isUndefined(mapping.type)) {
      return false;
    }

    if (isUndefined(mapping.value)) {
      return false;
    } else if (isString(mapping.value) && mapping.value.length === 0) {
      return false;
    }

    if (isEmpty(mapping.mapTo)) {
      return false;
    }
    return true;
  }
}
