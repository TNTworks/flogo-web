export interface FlowData {
  tasks?: Task[];
  errorHandler?: ErrorHandler;
  links?: Link[];
}

export interface ErrorHandler {
  tasks?: Task[];
  links?: Link[];
}

export interface Task {
  id: string;
  type: string;
  name?: string;
  description?: string;
  settings?: {
    iterate?: any;
  };
  activity: {
    ref: string;
    settings?: {
      flowURI?: string;
    };
    input: {
      [attributeName: string]: any;
    };
    mappings?: Mapping[];
  };
}

export interface Mapping {
  mapTo: string;
  type: string;
  value: any;
}

export interface Link {
  from: string;
  to: string;
  type?: string;
  value?: any;
}
