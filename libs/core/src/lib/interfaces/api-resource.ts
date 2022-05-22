import { Resource } from './resource';
import { Trigger } from './trigger';

export interface ApiResource<T = unknown> extends Resource<T> {
  appId?: string;
  // TODO: type of server app
  app?: any;
  triggers?: Trigger[];
}
