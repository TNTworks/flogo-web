import { Injectable } from '@angular/core';
import {
  ExpressionParser,
  NodeFactory,
  ParsedExpressionDetails,
  IParseResult,
} from '../models';
import {
  ValidatorReporter,
  // ValidatorVisitor,
  ValidationError,
} from '../models/validator';
import { ReferenceCollector } from '../models/reference-collector';

export interface ProcessedExpression {
  // todo: interface
  errors: any[];
  structureDetails: ParsedExpressionDetails;
  hasSyntaxErrors: boolean;
  hasSemanticErrors: boolean;
  expression: string;
}

@Injectable()
export class ExpressionProcessorService {
  processExpression(
    expression: string,
    expectedResultDataType: { type: string; array?: boolean },
    symbolTable: { [key: string]: any },
    relativeMapsTo?: string
  ): ProcessedExpression {
    let hasSyntaxErrors = false;
    let hasSemanticErrors = false;
    let errors = [];
    let structureDetails = null;
    expression = expression || '';

    const parseResult = this.parse(expression);
    const langTree = parseResult.getParseTree().getTree();

    if (langTree) {
      const {
        errors: semanticErrors,
        structureDetails: extractedDetails,
      } = this.validate(langTree, expectedResultDataType, symbolTable, relativeMapsTo);
      structureDetails = extractedDetails;
      if (semanticErrors && semanticErrors.length > 0) {
        hasSemanticErrors = true;
        errors = errors.concat(
          this.processSemanticErrors(semanticErrors, expression.length)
        );
      }
    } else {
      const syntaxErrors = parseResult.getErrors();
      if (syntaxErrors && syntaxErrors.length > 0) {
        hasSyntaxErrors = true;
        errors = errors.concat(this.processSyntaxErrors(syntaxErrors, expression.length));
      }
    }

    return {
      expression,
      errors,
      structureDetails,
      hasSyntaxErrors,
      hasSemanticErrors,
    };
  }

  private parse(expression: string): IParseResult {
    const expressionParser = new ExpressionParser();
    return expressionParser.parse(expression);
  }

  private validate(
    tree: any,
    expectedResultDataType: { type: string; array?: boolean },
    symbolTable: { [key: string]: any },
    relativeMapsTo?: string
  ) {
    const programNode = NodeFactory.createNode(tree, null);
    const reporter = new ValidatorReporter();
    const refsCollector = new ReferenceCollector(relativeMapsTo);
    // const validatorVisitor = new ValidatorVisitor(symbolTable, expectedResultDataType, reporter, refsCollector);
    const errors = null;

    // try {
    //   programNode.accept(validatorVisitor);
    //   errors = reporter.getErrors();
    // } catch (error) {
    //   console.error(error);
    //   const unexpectedErrors = [{ message: 'Unexpected error while validating expression' }];
    //   errors = errors ? errors.concat(unexpectedErrors) : unexpectedErrors;
    // }
    const structureDetails = {
      functionReferences: refsCollector.getFunctionReferences(),
      memberReferences: refsCollector.getMemberReferences(),
    };

    return { errors, structureDetails };
  }

  private processSemanticErrors(semanticErrors: ValidationError[], maxOffset: number) {
    return semanticErrors.map(e => ({
      message: e.message,
      location: this.getSemanticErrorLocation(e, maxOffset),
    }));
  }

  private getSemanticErrorLocation(e: ValidationError, maxOffset: number) {
    if (e.position) {
      return {
        startOffset: e.position.start.offset,
        endOffset: e.position.end.offset,
      };
    } else {
      return { startOffset: 0, endOffset: maxOffset };
    }
  }

  private processSyntaxErrors(syntaxErrors: any[], maxOffset: number) {
    return syntaxErrors.map(e => {
      return {
        message: e.getErrorMessage(),
        location: { startOffset: 0, endOffset: maxOffset },
      };
    });
  }
}
