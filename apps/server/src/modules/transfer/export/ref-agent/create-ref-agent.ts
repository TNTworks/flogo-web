import { ContributionSchema, ContributionType } from '@flogo-web/core';
import { ParsedImport } from '../../common/parsed-import';
import { parseImports } from '../../common/parse-imports';
import { RefAgent } from './ref-agent';
import { FunctionRefFinder } from './function-ref-finder';

export function createRefAgent(
  contributions: Map<string, ContributionSchema>,
  imports?: string[]
): RefAgent {
  const refFinder = new FunctionRefFinder(Array.from(contributions.values()));
  let importsByContribType = null;
  if (imports) {
    const predeterminedImports = parseImports(imports);
    importsByContribType = groupImportsByContribType(predeterminedImports, contributions);
  }
  return new RefAgent(refFinder, importsByContribType);
}

function groupImportsByContribType(
  predeterminedImports: ParsedImport[],
  contributions: Map<string, ContributionSchema>
): Map<ContributionType, ParsedImport[]> {
  const byType = new Map<ContributionType, ParsedImport[]>();
  predeterminedImports.forEach(i => {
    const contribType = contributions.get(i.ref).type;
    if (!byType.has(contribType)) {
      byType.set(contribType, []);
    }
    byType.get(contribType).push(i);
  });
  return byType;
}
