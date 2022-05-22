import { pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { MapperState } from '../../models';

export const selectMapperStatus = pipe(
  map((state: MapperState) => ({
    isDirty: state.isDirty,
    isValid: state.isValid,
  })),
  distinctUntilChanged(
    // tslint:disable-next-line:triple-equals -- no strict equality needed, "truthy" and "falsy" values are okay
    (prev, next) => prev.isDirty == next.isDirty && prev.isValid == next.isValid
  )
);
