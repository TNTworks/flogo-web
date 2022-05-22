import { DanglingSubflowReferencesCleaner } from './dangling-subflow-references-cleaner';

describe('exporter.utils.DanglingSubflowReferencesCleaner', () => {
  const task = {
    inputMappings: {
      foo: 'oof',
      dangling: 'abcd',
      bar: 'rab',
    },
  };
  const linkedFlow = {
    metadata: {
      input: [
        { name: 'foo', type: 'string' },
        { name: 'bar', type: 'string' },
      ],
    },
  };
  const cleanMappings = DanglingSubflowReferencesCleaner.create().cleanMappings(
    task,
    linkedFlow
  );

  test('should remove dangling references', () => {
    expect(cleanMappings.dangling).toBeUndefined();
  });

  test('valid mappings should stay', () => {
    expect(cleanMappings).toEqual({
      foo: 'oof',
      bar: 'rab',
    });
  });
});
