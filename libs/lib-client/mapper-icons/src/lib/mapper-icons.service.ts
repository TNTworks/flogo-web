import { Injectable } from '@angular/core';
import { TypeConnection, ValueType } from '@flogo-web/core';
import { MapperTreeNodeType } from './mapper-treenode-type.interface';

@Injectable()
export class MapperIconsService {
  private iconMap = {
    [ValueType.Array]: '#flogo-mapper-icon-array',
    [ValueType.Boolean]: '#flogo-mapper-icon-boolean',
    [ValueType.Double]: '#flogo-mapper-icon-double',
    [ValueType.Integer]: '#flogo-mapper-icon-integer',
    [ValueType.Long]: '#flogo-mapper-icon-long',
    [ValueType.Params]: '#flogo-mapper-icon-params',
    [ValueType.Bytes]: '#flogo-mapper-icon-bytes',
    [ValueType.Datetime]: '#flogo-mapper-icon-datetime',
    [ValueType.Any]: '#flogo-mapper-icon-any',
    [ValueType.Object]: '#flogo-mapper-icon-object',
    [ValueType.String]: '#flogo-mapper-icon-string',
    [`${ValueType.String}Array`]: '#flogo-mapper-icon-string-array',
    [`${ValueType.Double}Array`]: '#flogo-mapper-icon-double-array',
    [`${ValueType.Boolean}Array`]: '#flogo-mapper-icon-boolean-array',
    [`${ValueType.Object}Array`]: '#flogo-mapper-icon-object-array',
    [TypeConnection.Connection]: '#flogo-mapper-icon-connection',
  };

  getIcon(node: MapperTreeNodeType) {
    let dataType = node.dataType;
    if (dataType === 'array' && node.memberType) {
      dataType = `${node.memberType}Array`;
    }

    return this.iconMap[dataType];
  }
}
