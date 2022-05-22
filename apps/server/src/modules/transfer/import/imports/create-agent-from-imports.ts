import { ContributionSchema } from '@flogo-web/core';
import { ImportsRefAgent } from '@flogo-web/lib-server/core';
import { parseImports } from '../../common/parse-imports';
import { ExtractImportsRef } from './extract-imports-ref';
import { LegacyRefsDecorator } from './legacy-refs-decorator';

export function createFromImports(
  imports: string[],
  contribSchemas: Map<string, ContributionSchema>
): ImportsRefAgent {
  const parsedImports = parseImports(imports || []);
  let agent: ImportsRefAgent = new ExtractImportsRef(parsedImports, contribSchemas);
  agent = new LegacyRefsDecorator(agent);
  return agent;
}
