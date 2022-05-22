import { parse, RecognitionException, LexingError } from '@flogo-web/parser';

const getAsArray = fromErrorsArr => {
  return !!fromErrorsArr ? fromErrorsArr : [];
};

export class LanguageService {
  static doValidation(
    expression: string
  ): Promise<Array<RecognitionException | LexingError>> {
    if (!expression || !expression.trim()) {
      return Promise.resolve(<any>[]);
    }
    const parseResult = parse(expression);
    return Promise.resolve([
      ...getAsArray(parseResult.lexErrors),
      ...getAsArray(parseResult.parseErrors),
    ]);
  }
}
