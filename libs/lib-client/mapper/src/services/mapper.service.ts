import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { MapperTreeNode, MapperState } from '../models';
import { MapperController } from './mapper-controller';

@Injectable()
export class MapperService implements OnDestroy {
  state$: Observable<MapperState>;
  private controllerSrc: ReplaySubject<MapperController>;
  private controller: MapperController;

  constructor() {
    this.controllerSrc = new ReplaySubject<MapperController>(1);
    this.state$ = this.controllerSrc.pipe(
      filter(controller => !!controller),
      switchMap(controller => controller.state$)
    );
  }

  ngOnDestroy() {
    this.controllerSrc.unsubscribe();
  }

  setController(controller: MapperController) {
    this.controller = controller;
    if (this.controller) {
      this.controllerSrc.next(this.controller);
    }
  }

  selectInput(node: MapperTreeNode) {
    if (this.controller) {
      this.controller.selectInput(node);
    }
  }

  filterInputs(filterTerm: string) {
    if (this.controller) {
      this.controller.filterInputs(filterTerm);
    }
  }

  filterOutputs(filterTerm: string) {
    if (this.controller) {
      this.controller.filterOutputs(filterTerm);
    }
  }

  filterFunctions(filterTerm: string) {
    if (this.controller) {
      this.controller.filterFunctions(filterTerm);
    }
  }

  expressionChange(nodePath: string, expression: string) {
    if (this.controller) {
      this.controller.expressionChange(nodePath, expression);
    }
  }
}
