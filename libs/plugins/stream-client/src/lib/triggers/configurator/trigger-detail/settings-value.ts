import { ParseResult, Node } from '@flogo-web/parser';

export interface SettingValue {
  viewValue: string;
  parsedValue: any;
  parsingDetails?: ParseResult<Node>;
}
