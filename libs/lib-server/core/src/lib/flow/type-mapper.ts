import { invert } from 'lodash';

export const MAPPING_EXPRESSION_TYPE = {
  ASSIGN: 1,
  LITERAL: 2,
  EXPRESSION: 3,
  OBJECT: 4,
  ARRAY: 5,
};

export const TASK_TYPE = {
  ITERATOR: 'iterator',
  STANDARD: 'standard',
};
const taskTypeDictionary = {
  [TASK_TYPE.STANDARD]: 1,
  [TASK_TYPE.ITERATOR]: 2,
};

export const EXPRESSION_TYPE = {
  ASSIGN: 'assign',
  LITERAL: 'literal',
  EXPRESSION: 'expression',
  OBJECT: 'object',
  ARRAY: 'array',
};
const mappingTypesDictionary = {
  [EXPRESSION_TYPE.ASSIGN]: MAPPING_EXPRESSION_TYPE.ASSIGN,
  [EXPRESSION_TYPE.LITERAL]: MAPPING_EXPRESSION_TYPE.LITERAL,
  [EXPRESSION_TYPE.EXPRESSION]: MAPPING_EXPRESSION_TYPE.EXPRESSION,
  [EXPRESSION_TYPE.OBJECT]: MAPPING_EXPRESSION_TYPE.OBJECT,
  [EXPRESSION_TYPE.ARRAY]: MAPPING_EXPRESSION_TYPE.ARRAY,
};

export const LINK_TYPE = {
  SUCCESS: 'success',
  EXPRESSION: 'expression',
};
const linkTypesDictionary = {
  [LINK_TYPE.SUCCESS]: 0,
  [LINK_TYPE.EXPRESSION]: 1,
};

const fromStandard = {
  taskTypes: taskTypeDictionary,
  mappingTypes: mappingTypesDictionary,
  linkTypes: linkTypesDictionary,
};

const toStandard = {
  taskTypes: invert(taskTypeDictionary),
  mappingTypes: invert(mappingTypesDictionary),
  linkTypes: invert(linkTypesDictionary),
};

export const typeMapper = {
  fromStandard() {
    return fromStandard;
  },
  toStandard() {
    return toStandard;
  },
};
