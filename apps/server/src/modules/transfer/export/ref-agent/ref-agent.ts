import { ContributionType } from '@flogo-web/core';
import { ExportRefAgent } from '@flogo-web/lib-server/core';
import { ParsedImport } from '../../common/parsed-import';
import { FunctionRefFinder } from './function-ref-finder';

const formatImport = ([ref, { alias, isAliased }]) =>
  isAliased ? `${alias} ${ref}` : ref;
const formatEntries = (map: Map<string, any>) =>
  Array.from(map.entries()).map(formatImport);

interface ImportInfo {
  isAliased: boolean;
  alias: string;
}

export class RefAgent implements ExportRefAgent {
  private contribCategories = new Map<ContributionType, ContribCategory>();

  constructor(
    private functionsReverseLookup: FunctionRefFinder,
    predeterminedImports?: Map<ContributionType, ParsedImport[]>
  ) {
    if (predeterminedImports) {
      predeterminedImports.forEach((parsedImport, type) => {
        this.contribCategories.set(type, new ContribCategory(type, parsedImport));
      });
    }
  }

  getAliasRef(contribType: ContributionType, packageRef: string): string {
    let importInfo: ImportInfo;
    this.ensureContribCategory(contribType);
    const category = this.contribCategories.get(contribType);
    if (!category.isRegisteredPackage(packageRef)) {
      importInfo = category.registerPackage(packageRef);
    } else {
      importInfo = category.getPackageInfo(packageRef);
    }
    return importInfo && importInfo.alias ? `#${importInfo.alias}` : undefined;
  }

  registerFunctionName(functionName: string) {
    const ref = this.functionsReverseLookup.findPackage(functionName);
    this.ensureContribCategory(ContributionType.Function);
    const functions = this.contribCategories.get(ContributionType.Function);
    if (ref && !functions.isRegisteredPackage(ref)) {
      functions.setPackageInfo(ref, { isAliased: false, alias: undefined });
    }
  }

  formatImports(): string[] {
    return Array.from(this.contribCategories.values())
      .reduce(
        (all, category: ContribCategory) => all.concat(category.formatImports()),
        []
      )
      .sort();
  }

  private ensureContribCategory(contribType: ContributionType) {
    if (!this.contribCategories.has(contribType)) {
      this.contribCategories.set(contribType, new ContribCategory(contribType));
    }
  }
}

class ContribCategory {
  type: ContributionType;
  imports = new Map<string, ImportInfo>();
  predetermined = new Map<string, ImportInfo>();
  uniqueTracker = new Map<string, number>();

  constructor(contribType: ContributionType, predeterminedImports: ParsedImport[] = []) {
    this.type = contribType;
    predeterminedImports.forEach(({ ref, type, isAliased }) => {
      this.predetermined.set(ref, { alias: type, isAliased });
      this.uniqueTracker.set(type, 1);
    });
  }

  isRegisteredPackage(ref: string): boolean {
    return this.imports.has(ref);
  }

  registerPackage(packageRef: string): ImportInfo {
    const importInfo = this.createImportInfo(packageRef);
    this.imports.set(packageRef, importInfo);
    return importInfo;
  }

  getPackageInfo(ref: string): ImportInfo {
    return this.imports.get(ref);
  }

  setPackageInfo(ref: string, importInfo: ImportInfo): void {
    this.imports.set(ref, importInfo);
  }

  formatImports(): string[] {
    return formatEntries(this.imports);
  }

  private createImportInfo(ref: string): ImportInfo {
    let importInfo: ImportInfo;
    if (this.predetermined.has(ref)) {
      importInfo = this.predetermined.get(ref);
    } else {
      const [defaultType] = ref.split('/').slice(-1);
      importInfo = this.ensureUniqueAlias(defaultType);
    }
    return importInfo;
  }

  private ensureUniqueAlias(alias: string): { alias: string; isAliased: boolean } {
    let isAliased = false;
    if (this.uniqueTracker.has(alias)) {
      isAliased = true;
      const repeatCount = this.uniqueTracker.get(alias);
      this.uniqueTracker.set(alias, repeatCount + 1);
      alias = `${alias}_${repeatCount}`;
      this.uniqueTracker.set(alias, 1);
    } else {
      this.uniqueTracker.set(alias, 1);
    }
    return { alias, isAliased };
  }
}
