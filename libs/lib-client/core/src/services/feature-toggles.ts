import { Injectable, APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { RestApiService } from './restapi';

@Injectable({ providedIn: 'root' })
export class FeatureToggleService {
  features: { [featureName: string]: any };

  isFeatureEnabled(featureName: string) {
    return this.features && !!this.features[featureName];
  }
}

// needed to be exported because of AoT
export function featureToggleServiceFactory(
  apiService: RestApiService,
  featureService: FeatureToggleService
) {
  return () => {
    return apiService
      .get('_/features')
      .pipe(
        tap(features => (featureService.features = features)),
        catchError(() => EMPTY)
      )
      .toPromise();
  };
}

export const FEATURE_TOGGLES_APP_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: featureToggleServiceFactory,
  deps: [RestApiService, FeatureToggleService],
  multi: true,
};
