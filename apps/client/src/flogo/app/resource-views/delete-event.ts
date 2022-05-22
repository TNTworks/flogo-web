import { ResourceWithPlugin } from '../core/resource-with-plugin';

export interface DeleteEvent {
  triggerId: string;
  resource: ResourceWithPlugin;
}
