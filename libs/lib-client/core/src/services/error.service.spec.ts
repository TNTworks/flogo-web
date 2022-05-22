import { ErrorService, OperationalError } from './error.service';

describe('Service: ErrorService', function(this: { errorService: ErrorService }) {
  beforeAll(() => {
    this.errorService = new ErrorService();
  });

  describe('should create an operational error', () => {
    it('with the correct type', () => {
      const error = this.errorService.makeOperationalError(
        'MyError',
        'My custom message'
      );
      expect(error instanceof Error).toBe(true);
      expect(error.isOperational).toBe(true);
      expect(error.name).toEqual('MyError');
      expect(error.message).toEqual('My custom message');
    });

    it('with attached properties', () => {
      interface CustomError extends OperationalError {
        myProp: string;
        anotherProp: any[];
      }

      const error = <CustomError>this.errorService.makeOperationalError(
        'MyError',
        'My custom message',
        {
          myProp: 'a value',
          anotherProp: [1, 2, 3],
        }
      );
      expect(error instanceof Error).toBe(true);
      expect(error.myProp).toEqual('a value');
      expect(error.anotherProp).toEqual([1, 2, 3]);
    });

    it('and should not override standard error properties', () => {
      const error = this.errorService.makeOperationalError(
        'MyError',
        'My custom message',
        { name: 'DifferentName' }
      );
      expect(error.name).not.toEqual('DifferentName');
    });
  });
});
