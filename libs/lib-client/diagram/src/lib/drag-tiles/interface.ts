export interface TilesGroupedByZone<T = any> {
  preDropZone: T[];
  dropZone: T[];
  postDropZone: T[];
}

export interface DropActionData {
  itemId: string;
  parentId: string | null;
}
