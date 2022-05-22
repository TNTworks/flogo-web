import {
  ContributionSchema,
  FunctionsSchema,
  SingleFunctionSchema,
} from '@flogo-web/core';

// todo: should be a core utility?
const isFunctionContrib = (c: ContributionSchema): c is FunctionsSchema =>
  // todo: should be a core constant?
  c.type === 'flogo:function';

export class FunctionRefFinder {
  private functions = new Map<string, string>();

  constructor(fromContribs: ContributionSchema[]) {
    fromContribs.forEach((contrib: ContributionSchema) => {
      if (isFunctionContrib(contrib) && contrib.functions) {
        contrib.functions.forEach(
          addToFunctions(this.functions, contrib.name, contrib.ref)
        );
      }
    });
  }

  findPackage(functionName: string) {
    return this.functions.get(functionName);
  }
}

function addToFunctions(
  functions: Map<string, string>,
  namespace: string,
  packageRef: string
) {
  return (f: SingleFunctionSchema) => {
    functions.set(`${namespace}.${f.name}`, packageRef);
  };
}
