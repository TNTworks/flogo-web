import { FlogoAppModel } from '../engine';
import { Trigger } from './trigger';
import { Resource } from './resource';

export interface App {
  id: string;
  name: string;
  type: string;
  version?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  imports?: string[];
  resources?: Resource[];
  triggers?: Trigger[];
  properties?: FlogoAppModel.AppProperty[];
}
