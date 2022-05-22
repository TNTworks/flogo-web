import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivitySchema } from '@flogo-web/core';
import { ItemActivityTask } from '../core/interfaces/flow';

export interface DebugActivityTask extends ItemActivityTask {
  schemaHomepage: string;
  icon: string;
}

export function combineToDebugActivity(): OperatorFunction<
  [ActivitySchema, ItemActivityTask],
  DebugActivityTask
> {
  return (source: Observable<[ActivitySchema, ItemActivityTask]>) =>
    source.pipe(
      map(([schema, activity]) =>
        activity && schema
          ? { ...activity, schemaHomepage: schema.homepage, icon: schema.icon }
          : null
      )
    );
}
