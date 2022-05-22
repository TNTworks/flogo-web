export enum DiagramSelectionType {
  Node = 'node',
  Insert = 'insert',
}

export interface DiagramSelection {
  type: DiagramSelectionType;
  taskId: string;
  diagramId?: string;
}
