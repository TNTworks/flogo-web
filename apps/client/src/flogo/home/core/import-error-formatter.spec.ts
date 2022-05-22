import { LanguageService } from '@flogo-web/lib-client/language';

import { ImportErrorFormatterService } from './import-error-formatter.service';
import Spy = jasmine.Spy;
const mockImportErrorResponse = getMockData();

describe('Service: ImportErrorFormatterService', function(this: {
  service: ImportErrorFormatterService;
  mockTranslateService: LanguageService;
}) {
  beforeEach(() => {
    this.mockTranslateService = jasmine.createSpyObj<LanguageService>(
      'translateService',
      ['instant']
    );
    this.service = new ImportErrorFormatterService(this.mockTranslateService);
  });

  it('Should return the proper validation error label', () => {
    const spyTranslateService = <Spy>this.mockTranslateService.instant;
    spyTranslateService.and.callFake(function(key) {
      return key;
    });
    const errorLabel = this.service.formatMessageHeader(
      mockImportErrorResponse[0].meta.details[0].keyword
    );
    expect(errorLabel).toEqual('IMPORT-ERROR:TYPE_MISMATCH');
  });

  it('Should return the proper validation error message', () => {
    const spyTranslateService = <Spy>this.mockTranslateService.instant;
    spyTranslateService.and.callFake(function(key) {
      return key;
    });
    const errorLabel = this.service.formatErrorMessage(
      mockImportErrorResponse[0].meta.details[2]
    );
    expect(errorLabel).toEqual('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT');
  });

  it('Should return rational validation error message', () => {
    const errors = this.service.getErrorsDetails(mockImportErrorResponse[0].meta.details);
    expect(errors.length).toEqual(3);
  });
});

function getMockData() {
  return [
    {
      status: 400,
      title: 'Validation error',
      detail: 'There were one or more validation problems',
      meta: {
        details: [
          {
            keyword: 'type',
            dataPath: '.name',
            schemaPath: '#/properties/name/type',
            message: 'should be string',
            data: 3543252,
          },
          {
            keyword: 'type',
            dataPath: '.triggers',
            schemaPath: '#/properties/triggers/type',
            message: 'should be array',
            data: {},
          },
          {
            keyword: 'activity-installed',
            message: 'Activity "38756435643" is not installed',
            data: 38756435643,
            dataPath: '.resources[0].data.flow.rootTask.tasks[0].activityRef',
            schemaPath: '#/properties/activityRef/activity-installed',
            params: {
              ref: 'github.com/some/activity',
            },
          },
          {
            keyword: 'if',
            dataPath: '.resources[0].data.flow.rootTask.tasks[0]',
            schemaPath: '#/if',
            params: {
              failingKeyword: 'else',
            },
            message: 'should match "else" schema',
          },
        ],
      },
    },
  ];
}
