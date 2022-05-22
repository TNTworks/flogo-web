import { ContributionSchema, ContributionType } from '@flogo-web/core';
import { ImportsRefAgent } from '@flogo-web/lib-server/core';
import { ParsedImport } from '../../common/parsed-import';

const ALIAS_PREFIX = '#';

export class ExtractImportsRef implements ImportsRefAgent {
  private imports: Map<ContributionType, Map<string, string>>;
  constructor(
    parsedImports: ParsedImport[],
    contribSchemas: Map<string, ContributionSchema>
  ) {
    this.imports = new Map();
    Object.values(ContributionType).forEach(type =>
      this.imports.set(type, new Map<string, string>())
    );
    parsedImports.forEach(parsedImport => {
      const contrib = contribSchemas.get(parsedImport.ref);
      if (contrib) {
        this.imports.get(contrib.type).set(parsedImport.type, parsedImport.ref);
      }
    });
  }

  getPackageRef(category: ContributionType, alias: string) {
    let actualRef = alias;
    if (alias.startsWith(ALIAS_PREFIX)) {
      actualRef = this.imports.get(category).get(alias.substr(1));
    }
    return actualRef;
  }
}
