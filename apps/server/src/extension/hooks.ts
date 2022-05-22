import { Logger } from 'winston';
import { ResourceHook, HookContext, ResourceHooks } from '@flogo-web/lib-server/core';

export type ResourceLifecycleStage = 'create' | 'update' | 'remove' | 'list';
const lifecycleStages: ResourceLifecycleStage[] = ['create', 'update', 'remove', 'list'];

type HookRegistry = Map<ResourceLifecycleStage, ResourceHook[]>;

const noOp = () => {};

export class HookApplicator {
  private readonly beforeHooks: HookRegistry = new Map();
  private readonly afterHooks: HookRegistry = new Map();
  private readonly log: (msg) => void;

  constructor(logger?: Logger) {
    this.log = logger ? msg => logger.debug(`${HookApplicator.name}: ${msg}`) : noOp;
  }

  load(resourceHooks: ResourceHooks) {
    if (!resourceHooks) {
      return;
    }
    if (resourceHooks.before) {
      this.log('Registering before hooks');
      mergeHooks(resourceHooks.before, this.beforeHooks, this.log);
    }
    if (resourceHooks.after) {
      this.log('Registering after hooks');
      mergeHooks(resourceHooks.after, this.afterHooks, this.log);
    }
  }

  async wrapAndRun(
    forStage: ResourceLifecycleStage,
    context: HookContext,
    action: ResourceHook
  ) {
    this.throwIfUnknownStage(forStage);

    // this.log('Running hooks before ' + forStage);
    await this.runHooks(this.beforeHooks.get(forStage), context);

    // this.log('Running action ' + forStage);
    await action(context);

    // this.log('Running hooks after ' + forStage);
    await this.runHooks(this.afterHooks.get(forStage), context);

    return context;
  }

  runBefore(
    forStage: ResourceLifecycleStage,
    context: HookContext
  ): Promise<HookContext> {
    this.throwIfUnknownStage(forStage);
    // this.log('Running hooks before ' + forStage);
    return this.runHooks(this.beforeHooks.get(forStage), context);
  }

  runAfter(forStage: ResourceLifecycleStage, context: HookContext): Promise<HookContext> {
    this.throwIfUnknownStage(forStage);
    // this.log('Running hooks after ' + forStage);
    return this.runHooks(this.afterHooks.get(forStage), context);
  }

  private async runHooks(hooks: ResourceHook[] | null, context: HookContext) {
    if (!hooks) {
      return context;
    }
    for (const hook of hooks) {
      await hook(context);
    }
  }

  private throwIfUnknownStage(stage: any) {
    if (!lifecycleStages.includes(stage)) {
      throw new Error(`HookApplicator: Uknown lifecycle stage "${stage}"`);
    }
  }
}

function mergeHooks(
  hooks: { [stage: string]: ResourceHook },
  into: Map<ResourceLifecycleStage, ResourceHook[]>,
  log: (msg) => void = noOp
) {
  lifecycleStages.forEach(stageName => {
    let hooksForStage = into.get(stageName);
    const hook = hooks[stageName];
    if (!hook) {
      log('No hook for ' + stageName);
      return;
    }
    if (typeof hook !== 'function') {
      throw new Error(
        `ResourceHooks: Expecting only functions for hooks but got [${typeof hook}] (for stage ${stageName})`
      );
    }
    if (!hooksForStage) {
      hooksForStage = [];
      into.set(stageName, hooksForStage);
    }
    // log('Registered hook for ' + stageName);
    hooksForStage.push(hooks[stageName]);
  });
}
