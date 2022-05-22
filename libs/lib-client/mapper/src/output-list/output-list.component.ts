import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { selectFilterFromOutputs, selectNodesFromOutputs } from '../services/selectors';
import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { TYPE_PARAM_OUTPUT } from '../services/dragging.service';
import { MapperTreeNode } from '../models';
import { MapperService } from '../services/mapper.service';

@Component({
  selector: 'flogo-mapper-output-list',
  templateUrl: 'output-list.component.html',
  styleUrls: ['output-list.component.css'],
})
export class OutputListComponent implements OnInit, OnDestroy {
  @Input() searchPlaceholder: string;
  @Output() selectNode = new EventEmitter<MapperTreeNode>();
  treeNodes$: Observable<MapperTreeNode[]>;
  filterTerm$: Observable<string>;
  dragType = TYPE_PARAM_OUTPUT;

  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private mapperService: MapperService) {}

  ngOnInit() {
    const state$ = this.mapperService.state$.pipe(shareReplay());
    this.treeNodes$ = state$.pipe(selectNodesFromOutputs);
    this.filterTerm$ = state$.pipe(selectFilterFromOutputs);
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onOutputSelect(node: MapperTreeNode) {
    this.selectNode.emit(node);
  }

  onSearchChange(searchTerm: string) {
    this.mapperService.filterOutputs(searchTerm);
  }
}
