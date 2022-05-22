import { ParsedImport } from './parsed-import';

export const IMPORT_SYNTAX = /^(?:([\w-\.]+)\s+)?((?:[\w-\.]+\/)+([\w-\.]+))$/;

/**
Parse a flogo.json import and return its parts.

An import could has the following possibilities:
- Simple ref ("github.com/project-flogo/activity/rest"): in which case the type is the last segment in the ref ('rest')
- Aliased import ("myAlias github.com/project-flogo/activity/rest"): where the type will be the specified alias "myAlias"

@return {ParsedImport}
*/
export function parseSingleImport(fromImport: string): ParsedImport {
  const [, alias, ref, type] = IMPORT_SYNTAX.exec(fromImport.trim());
  return {
    ref,
    type: alias || type,
    isAliased: !!alias,
  };
}

/**
Parse a collection of flogo.json imports and return its parts (ref and alias).

@see parseSingleImport
*/
export function parseImports(imports: string[]) {
  return imports.map(parseSingleImport);
}
