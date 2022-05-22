export namespace FlogoAppModel {
  export interface App {
    name: string;
    type?: string;
    version: string;
    appModel: string;
    description?: string;
    // only >= v0.9.0
    imports?: string[];
    properties?: AppProperty[];
    triggers?: Trigger[];
    resources?: Resource[];
    actions?: Action[];
  }

  export interface AppProperty {
    name: string;
    type: string;
    value: string;
  }

  export interface Trigger {
    id: string;
    ref: string;
    // todo: confirm required
    name?: string;
    description?: string;
    settings?: Settings;
    handlers?: Handler[];
  }

  export interface Resource<T = unknown> {
    id: string;
    data: T;
  }

  export interface Settings {
    [settingName: string]: any;
  }

  type MappingType = 'assign' | 'literal' | 'expression' | 'object' | 'array';

  export interface Mapping {
    type: MappingType;
    value: any;
    mapTo: string;
  }

  export type Handler = NewHandler | LegacyHandler;

  // only >= v0.9.0
  export interface NewHandler {
    settings: Settings;
    action: {
      /* streams-plugin-todo: Need to impose a restriction that either id or ref+settings is required */
      id?: string;
      ref?: string;
      settings?: Settings;
      input?: {
        [inputName: string]: any;
      };
      output?: {
        [outputName: string]: any;
      };
    };
  }

  export interface LegacyHandler {
    settings: Settings;
    action: {
      ref: string;
      data: object;
      mappings?: {
        input?: Mapping[];
        output?: Mapping[];
      };
    };
  }

  export interface Action<PluginActionSettings = object> {
    id: string;
    ref: string;
    settings: PluginActionSettings;
  }
}
