import { ValidationErrorDetail, isValidationError } from '@flogo-web/lib-server/core';

const prefixDataPath = (prefix: string) => (d: ValidationErrorDetail) => ({
  ...d,
  dataPath: `${prefix}${d.dataPath}`,
});

export function tryAndAccumulateValidationErrors<T, Q>(
  collection: T[],
  map: (element: T) => Q,
  makeErrorPath: (index: number) => string
): { result: Q[]; errors: null | ValidationErrorDetail[] } {
  const validationErrors = [];
  const result = collection.map((element, index) => {
    try {
      return map(element);
    } catch (e) {
      handleError(e, index);
    }
  });
  return {
    result,
    errors: validationErrors.length > 0 ? validationErrors : null,
  };

  function handleError(e, resourceIndex: number) {
    if (isValidationError(e)) {
      const errorPath = makeErrorPath(resourceIndex);
      const errorDetails = e.details.errors.map(prefixDataPath(errorPath));
      validationErrors.push(...errorDetails);
    } else {
      throw e;
    }
  }
}
