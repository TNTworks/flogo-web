import { MAPPING_EXPRESSION_TYPE } from '@flogo-web/lib-server/core';
import { FlogoAppModel } from '@flogo-web/core';
import { normalizeHandlerMappings } from './normalize-handler-mappings';

describe('importer.common.normalize-handler-mappings', () => {
  test('handles handlers without actionMappings', () => {
    const testCases: Partial<FlogoAppModel.Handler['action']>[] = [
      {},
      { mappings: null },
      { mappings: {} },
      { mappings: { input: [] } },
      { mappings: { output: [] } },
      { input: null },
      { output: null },
      { input: {} },
      { output: {} },
    ];
    testCases.forEach(testAction =>
      expect(
        normalizeHandlerMappings({ action: testAction } as FlogoAppModel.Handler)
      ).toBeTruthy()
    );
  });

  test('prefixes legacy mappings with assign symbol', () => {
    const legacyAction: Partial<FlogoAppModel.LegacyHandler['action']> = {
      mappings: {
        input: [
          {
            value: 'fromTrigger',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field1',
          },
          {
            value: 'property.subaccess',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field2',
          },
          {
            value: 'property.someArray[0]',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field3',
          },
          {
            value: '$.alreadyPrefixed',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field4',
          },
          {
            value: '$activity[myActivity].foo.bar',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field5',
          },
        ] as any[],
        output: [
          {
            value: 'fromFlow',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field1',
          },
          {
            value: 'property.subaccess',
            type: MAPPING_EXPRESSION_TYPE.EXPRESSION,
            mapTo: 'field2',
          },
          {
            value: { x: '1' },
            type: MAPPING_EXPRESSION_TYPE.OBJECT,
            mapTo: 'field3',
          },
          {
            value: 'foobar',
            type: MAPPING_EXPRESSION_TYPE.LITERAL,
            mapTo: 'field4',
          },
        ] as any[],
      },
    };

    const result = normalizeHandlerMappings({
      action: legacyAction,
    } as FlogoAppModel.LegacyHandler);

    expect(result.actionMappings).toEqual({
      input: {
        field1: '=$.fromTrigger',
        field2: '=$.property.subaccess',
        field3: '=$.property.someArray[0]',
        field4: '=$.alreadyPrefixed',
        field5: '=$activity[myActivity].foo.bar',
      },
      output: {
        field1: '=$.fromFlow',
        field2: '=property.subaccess',
        field3: { x: '1' },
        field4: 'foobar',
      },
    });
  });
});
