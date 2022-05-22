import { startCase } from 'lodash';

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from '@flogo-web/lib-client/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
const SERVER_NAMES = ['engine', 'stateServer', 'flowServer'];

@Component({
  selector: 'flogo-config',
  templateUrl: 'config.component.html',
  styleUrls: ['config.component.less'],
})
export class FlogoConfigComponent {
  public servers$: Observable<any[]>;
  public location = location;
  public logs: Array<{ label: string; url: string }>;

  constructor(
    private _router: Router,
    private _configurationService: ConfigurationService
  ) {
    this.init();
    this.logs = [
      {
        label: 'View Test Engine Log',
        url: `${environment.hostname}/_logs/engine.log`,
      },
      {
        label: 'View Flogo Web App Log',
        url: `${environment.hostname}/_logs/app.log`,
      },
    ];
  }

  init() {
    this.servers$ = this._configurationService.getConfig().pipe(
      map(configs => {
        return Object.entries(configs)
          .filter(([name]) => SERVER_NAMES.indexOf(name) !== -1)
          .map(([name, config]) => {
            config.name = name;
            return {
              _label: startCase(name),
              _key: name,
              _display: config && (config.port === '8080' || config.port === 8080),
              config: config,
            };
          });
      })
    );
  }

  onRestart(server: any) {
    console.log(server);
    const port = (server && server.config && server.config.port) || undefined;
    if (port === '8080' || port === 8080) {
      this._configurationService
        .resetEngine()
        .toPromise()
        .then(res => {
          console.log('Restart test engine successful. res: ', res);
        })
        .catch(err => {
          console.log('Restart test engine errror. err: ', err);
        });
    }
  }
}
