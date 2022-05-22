import { FlogoAppModel } from '@flogo-web/core';

export namespace FlowResourceModel {
  import Settings = FlogoAppModel.Settings;

  export interface FlowResourceData {
    name: string;
    description: string;
    metadata: {
      input?: MetadataDefinition[];
      output?: MetadataDefinition[];
    };
    tasks?: Task[];
    links?: Link[];
    errorHandler?: {
      tasks?: Task[];
      links?: Link[];
    };
  }

  export interface Link {
    from: string;
    to: string;
    type?: string;
    value?: any;
  }

  export interface Task {
    id: string;
    name: string;
    description?: string;
    type?: 'standard' | 'iterator';
    settings?: Settings;
    activity: Activity;
  }

  export type Activity = NewActivity | LegacyActivity;

  /**
   * from >= v0.9.0
   * */
  export interface NewActivity {
    ref: string;
    settings?: {
      [settingName: string]: any;
    };
    input?: {
      [inputName: string]: any;
    };
  }

  export interface LegacyActivity {
    ref: string;
    mappings?: {
      input?: FlogoAppModel.Mapping[];
      output?: FlogoAppModel.Mapping[];
    };
    input?: {
      [inputName: string]: any;
    };
  }

  export interface MetadataDefinition {
    name: string;
    type: string;
  }
}
