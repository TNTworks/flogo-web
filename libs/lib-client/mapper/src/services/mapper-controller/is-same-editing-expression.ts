export function isSameEditingExpression(
  prev: { expression: string },
  next: { expression: string }
) {
  if ((!prev && next) || (!next && prev)) {
    return false;
  }
  return prev.expression === next.expression;
}
