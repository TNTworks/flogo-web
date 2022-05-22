import { Dictionary } from '../common';
import { GraphNode } from './node';

export type NodeDictionary = Dictionary<GraphNode>;

export interface DiagramGraph {
  rootId: string;
  nodes: NodeDictionary;
}

/**
 * Exporting DiagramGraph as FlowGraph which is imported in plugins-flow-client.
 * @deprecated
 */
export { DiagramGraph as FlowGraph };
