import { Injectable } from '@angular/core';
import { ContributionSchema } from '@flogo-web/core';
import { Subject } from 'rxjs';

@Injectable()
export class ContribInstallerService {
  private contribInstalledSubscriber = new Subject<ContributionSchema>();
  contribInstalled$ = this.contribInstalledSubscriber.asObservable();

  afterContribInstalled(contribDetails: ContributionSchema) {
    this.contribInstalledSubscriber.next(contribDetails);
  }
}
