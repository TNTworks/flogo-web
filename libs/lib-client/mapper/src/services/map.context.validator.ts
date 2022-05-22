import { Injectable } from '@angular/core';
import { IMapperResult, IMapContextValidator, MapperContext } from '../models';

@Injectable()
export class MapContextValidator implements IMapContextValidator {
  validate(context: MapperContext): IMapperResult {
    return null;
  }
}
