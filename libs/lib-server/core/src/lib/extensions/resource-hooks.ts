import { Resource } from '@flogo-web/core';

export interface HookContext {
  // todo: add service locator
  // readonly service: ServiceLocator;
  resource: Partial<Resource>;
}

export type ResourceHook<C extends HookContext = HookContext> = (
  context: C
) => Promise<any> | void;

export interface ResourceHooks {
  before?: {
    create?: ResourceHook;
    update?: ResourceHook<UpdateResourceContext>;
    list?: ResourceHook;
    remove?: ResourceHook;
  };
  after?: {
    create?: ResourceHook;
    update?: ResourceHook<UpdateResourceContext>;
    list?: ResourceHook;
    remove?: ResourceHook;
  };
}

export interface UpdateResourceContext extends HookContext {
  changes: Partial<Resource>;
  existingResource: Resource;
}

export interface ServiceLocator {
  get<T>(name: string): T;
}
