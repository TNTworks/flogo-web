export interface Properties {
  [name: string]: {
    type: string;
    properties?: Properties;
  };
}

export interface MapperSchema {
  type: string;
  properties?: Properties;
  required?: string[];
  title?: string;
  rootType?: string;
}
