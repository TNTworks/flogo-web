import { MapperTreeNode } from './mapper-treenode.model';
import { Mappings } from './mappings';

export interface TreeState {
  filterTerm: string | null;
  nodes: MapperTreeNode[];
}

export interface InputTreeState {
  filterTerm: string | null;
  nodes: { [path: string]: MapperTreeNode };
}

export interface MapperState {
  isValid?: boolean;
  isDirty?: boolean;
  mappings: Mappings;
  mappingKey?: string;
  inputs: InputTreeState;
  outputs: TreeState;
  functions: TreeState;
}

export interface OutputContext {
  tree: MapperTreeNode[];
  mappings: Mappings;
  mappingKey: string;
  /***
   * Relative references ($.references) are relative to this path
   */
  mapRelativeTo: string;
  symbolTable: any;
}
