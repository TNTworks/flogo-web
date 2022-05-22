import { MapperTreeNode } from '@flogo-web/lib-client/mapper';
import { ROOT_TYPES } from '../../core';

export function makeSnippet(nodes: MapperTreeNode[]) {
  const [root, propName] = nodes;
  let expressionHead = '';
  let expressionTailParts;
  const resolver = root.data.rootType;
  const nodeName = root.data.nodeName;
  const makeResolvable = expr => '$' + expr;
  if (resolver === ROOT_TYPES.STAGE) {
    expressionHead = makeResolvable(expressionHead);
    expressionTailParts = nodes.slice(1);
  } else if (resolver === ROOT_TYPES.PIPELINE) {
    expressionHead = makeResolvable(nodeName);
    expressionTailParts = nodes.slice(1);
  } else {
    expressionHead = nodeName.indexOf('$') === -1 ? '$.' + nodeName : nodeName;
    expressionTailParts = nodes.slice(1);
  }
  return [expressionHead].concat(expressionTailParts.map(n => n.data.nodeName)).join('.');
}
