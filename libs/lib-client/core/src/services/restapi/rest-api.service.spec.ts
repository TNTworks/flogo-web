import { HttpHeaders, HttpClient } from '@angular/common/http';
import { RestApiService } from './rest-api.service';
import { HttpUtilsService } from './http-utils.service';
import { Observable, of as observableOf } from 'rxjs';

describe('restapi.rest-api.service', function() {
  runTestSuite('::get()', (restApiService: RestApiService) =>
    restApiService.get('/some/endpoint')
  );
  runTestSuite('::post()', (restApiService: RestApiService) =>
    restApiService.post('/some/endpoint')
  );
  runTestSuite('::put()', (restApiService: RestApiService) =>
    restApiService.put('/some/endpoint')
  );
  runTestSuite('::patch()', (restApiService: RestApiService) =>
    restApiService.patch('/some/endpoint')
  );
  runTestSuite('::delete()', (restApiService: RestApiService) =>
    restApiService.delete('/some/endpoint')
  );
});

function runTestSuite(
  description,
  execMethodUnderTest: (restApiService: RestApiService) => Observable<any>
) {
  describe(description, function() {
    let restApiService: RestApiService;
    let httpClient: jasmine.SpyObj<HttpClient>;

    beforeEach(function() {
      httpClient = jasmine.createSpyObj<HttpClient>('HttpClient', ['request']);
      restApiService = new RestApiService(
        new HttpHeaders({}),
        httpClient,
        new HttpUtilsService()
      );
    });

    describe('given a response wrapped in a "data" top level member', function() {
      it('should unwrap the data', function(done) {
        httpClient.request.and.returnValue(observableOf({ data: { foo: 'some value' } }));
        execMethodUnderTest(restApiService).subscribe(response => {
          expect(response).toEqual({ foo: 'some value' });
          done();
        });
      });
    });

    describe('given a null response', function() {
      it('should not error', function(done) {
        httpClient.request.and.returnValue(observableOf(null));
        execMethodUnderTest(restApiService).subscribe(response => {
          expect(response).toEqual(null);
          done();
        });
      });
    });
  });
}
