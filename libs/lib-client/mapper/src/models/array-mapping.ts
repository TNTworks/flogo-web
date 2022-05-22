// TODO: extract multiple
export const EXPRESSION_FOR_EACH = /^\s*array\.forEach\((.*)\)\s*$/;

export interface ArrayMappingInfo {
  isForEach: boolean;
  params: string[];
  node?: any;
  fullLinkedPath?: string;
}

export class ArrayMappingHelper {
  static processExpressionForEach(expression: string): ArrayMappingInfo {
    const matches = EXPRESSION_FOR_EACH.exec(expression);
    const isForEach = !!matches;
    let params = [];
    if (matches) {
      // todo: escape expression for editor when using snippets?
      params = matches[1]
        .split(',')
        .map(param => param.trim())
        .filter(param => !!param);
    }
    return { isForEach, params };
  }

  static applyExpressionForEach(variable: string) {
    // todo: escape expression for editor when using snippets?
    return `array.forEach(${variable})`;
  }
}
