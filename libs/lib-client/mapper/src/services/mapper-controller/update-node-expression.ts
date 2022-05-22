import { resolveExpressionType } from '@flogo-web/parser';
import { MapperTreeNode } from '../../models';

export function updateNodeExpression(currentNode: MapperTreeNode, expression: string) {
  const isExpressionInvalid =
    expression && expression.trim() && !resolveExpressionType(expression);
  return {
    ...currentNode,
    data: {
      ...currentNode.data,
      expression,
    },
    isInvalid: isExpressionInvalid,
    isDirty: currentNode.isDirty || expression !== currentNode.data.expression,
  };
}
