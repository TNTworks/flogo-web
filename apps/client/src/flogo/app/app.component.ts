import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params as RouteParams } from '@angular/router';
import { Resource } from '@flogo-web/core';
@Component({
  selector: 'flogo-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.less'],
})
export class FlogoApplicationComponent implements OnInit {
  public appId: string;

  constructor(private router: Router, private route: ActivatedRoute) {}

  public ngOnInit() {
    this.route.params.subscribe((params: RouteParams) => {
      this.appId = params.appId;
    });
  }

  public onAppDeleted() {
    this.router.navigate(['/']);
  }

  public onResourceSelected({ id, type }: Resource) {
    this.router.navigate(['/resources', id, type]);
  }
}
