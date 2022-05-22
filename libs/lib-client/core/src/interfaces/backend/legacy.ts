import { Dictionary } from '../common';

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Attribute {
  name: string;
  type: string;
  value: string;
  required?: boolean;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Mapping {
  type: number;
  value: any;
  mapTo: string;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Task {
  id: any;
  type: number;
  activityType: string;
  activityRef?: string;
  name?: string;
  description?: string;
  attributes: flowToJSON_Attribute[];
  settings?: flowToJSON_Settings;
  inputMappings: Dictionary<any>;
  ouputMappings: flowToJSON_Mapping[];
  activitySettings: { [settingName: string]: any };
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Settings {
  iterate?: string;
  flowPath?: string;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface flowToJSON_Link {
  id: number;
  type: number;
  from: any;
  to: any;
  name?: string;
  value?: any;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface triggerToJSON_TriggerInfo {
  name: string;
  settings: any;
  handlers: any;
}

// Disabling tslint rule for legacy purposes
/* tslint:disable-next-line:class-name */
export interface triggerToJSON_Trigger {
  triggers: triggerToJSON_TriggerInfo[];
}
