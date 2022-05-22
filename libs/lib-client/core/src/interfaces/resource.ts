import { App, Metadata, ContributionSchema } from '@flogo-web/core';
import { Dictionary } from './common/dictionary';
import { FlowGraph as DiagramGraph } from './graph';

export interface BaseResourceState<ResourceItem = unknown> {
  id: string;
  name: string;
  description: string;
  appId?: string;
  app: Partial<App>;
  metadata?: Metadata;
  /* The structure of the item is defined by the plugin */
  mainItems: Dictionary<ResourceItem>;
  mainGraph: DiagramGraph;
  schemas: Dictionary<ContributionSchema>;
}
