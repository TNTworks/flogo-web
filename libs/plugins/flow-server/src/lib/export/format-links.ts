import { isEmpty } from 'lodash';
import { MapperUtils } from '@flogo-web/core';
import { typeMapper, ExportRefAgent } from '@flogo-web/lib-server/core';
import { FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE as LEGACY_LINK_TYPE } from '../constants';

export function formatLinks(links = [], refAgent: ExportRefAgent) {
  const stdTypeMapper = typeMapper.toStandard();
  const registerFunction = (fn: string) => refAgent.registerFunctionName(fn);
  return links.map(fromLink => {
    const type =
      fromLink.type !== LEGACY_LINK_TYPE.DEFAULT
        ? stdTypeMapper.linkTypes[fromLink.type]
        : undefined;
    if (!isEmpty(fromLink.value)) {
      MapperUtils.functions
        .parseAndExtractReferences(fromLink.value)
        .forEach(registerFunction);
    }
    return {
      ...fromLink,
      id: undefined,
      type,
    };
  });
}
