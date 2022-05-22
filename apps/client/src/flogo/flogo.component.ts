import { Component, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  Params,
  NavigationEnd,
  NavigationCancel,
  NavigationStart,
  RouterEvent,
} from '@angular/router';
import { delay } from 'rxjs/operators';

@Component({
  // disabling component-selector rule as the main application component name does not require it
  // tslint:disable-next-line:component-selector
  selector: 'flogo',
  templateUrl: 'flogo.component.html',
  styleUrls: ['flogo.component.less'],
})
export class FlogoAppComponent implements OnInit {
  public isPageLoading = true;
  public showNav = true;

  constructor(public router: Router, private activatedRoute: ActivatedRoute) {}

  public ngOnInit() {
    this.router.events.pipe(delay(0)).subscribe((event: RouterEvent): void => {
      if (event instanceof NavigationStart) {
        this.isPageLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.isPageLoading = false;
      }
    });

    this.activatedRoute.queryParams.subscribe(
      (params: Params) => (this.showNav = !params['nonav'])
    );
  }
}
