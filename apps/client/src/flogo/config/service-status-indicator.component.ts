import {
  throwError as observableThrowError,
  combineLatest,
  BehaviorSubject,
  interval,
  Subscription,
} from 'rxjs';
import { catchError, distinctUntilChanged, retry, switchMap } from 'rxjs/operators';
import { Component, Input, OnInit, DoCheck, OnDestroy } from '@angular/core';

import { getURL } from '@flogo-web/lib-client/common';
import { ConfigurationService, ServiceUrlConfig } from '@flogo-web/lib-client/core';

const PING_INTERVAL_MS = 5000;

@Component({
  selector: 'flogo-config-service-status-indicator',
  template: `
    <i
      [title]="info"
      class="fa"
      [style.color]="color"
      [ngClass]="{
        'fa-circle':
          status == 'online' || status == 'offline' || status == 'online-warning',
        'fa-circle-o': !status
      }"
    >
    </i>
  `,
})
export class ServiceStatusIndicatorComponent implements OnInit, DoCheck, OnDestroy {
  @Input() urlConfig: ServiceUrlConfig = null;
  status: string = null;
  statusCode: any = null;

  private configChangeSubject: BehaviorSubject<ServiceUrlConfig> = null;
  private subscription: Subscription = null;
  private colors: any = {
    online: 'green',
    'online-warning': 'gold',
    offline: 'red',
    unknown: 'orange',
  };

  constructor(private configService: ConfigurationService) {
    this.configChangeSubject = new BehaviorSubject(this.urlConfig);
  }

  ngOnInit() {
    const configChangeStream = this.configChangeSubject.pipe(distinctUntilChanged());

    configChangeStream.subscribe(() => (this.status = null));

    this.subscription = combineLatest(configChangeStream, interval(PING_INTERVAL_MS))
      .pipe(
        switchMap(([config]: [ServiceUrlConfig, any]) =>
          this.configService.pingService(config)
        ),
        catchError((error: any) => {
          this.statusCode = error.status;
          if (error.status === 500 || error.status === 502) {
            this.status = 'offline';
          } else {
            this.status = 'online-warning';
          }
          // TODO: report if error 500?
          // TODO: when there are cors issues we get also 200 code
          return observableThrowError(error);
        }),
        retry()
      )
      .subscribe((result: any) => {
        this.status = 'online';
        this.statusCode = result.status;
      });
  }

  ngDoCheck() {
    this.configChangeSubject.next(this.urlConfig);
  }

  ngOnDestroy() {
    console.log('Destroying', this.buildUrl());
    if (this.subscription) {
      console.log('Unsubscribing');
      this.subscription.unsubscribe();
    } else {
      console.log('Not unsubscribing');
    }
  }

  get color() {
    return this.colors[this.status] || this.colors.unknown;
  }

  get info() {
    if (this.status === 'online-warning') {
      return `Online but returned status code ${this.statusCode}`;
    }
    return '';
  }

  private buildUrl() {
    if (this.urlConfig) {
      const config = this.urlConfig;
      const name = this.urlConfig.name ? `/${this.urlConfig.name}` : '';
      const testPath = this.urlConfig.testPath ? `/${this.urlConfig.testPath}` : '';
      return `${getURL(config)}${name}${testPath}`;
    }
    return null;
  }
}
