export interface ParsedImport {
  /** parsed ref */
  ref: string;
  /** parsed type (will equal to the alias if one was specified) */
  type: string;
  /** true if an alias was specified */
  isAliased: boolean;
}
