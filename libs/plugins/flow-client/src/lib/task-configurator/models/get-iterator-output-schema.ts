export const ITERATOR_OUTPUT_KEY = 'iteration';

export function getIteratorOutputSchema() {
  return {
    type: 'object',
    properties: {
      [ITERATOR_OUTPUT_KEY]: {
        type: 'object',
        rootType: 'iterator',
        properties: {
          key: {
            type: 'string',
          },
          value: {
            type: 'any',
          },
        },
      },
    },
  };
}
