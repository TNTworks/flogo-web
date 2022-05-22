import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import {
  selectCurrentNode,
  selectFilteredNodes,
  selectInputFilter,
} from '../services/selectors';
import { MapperService } from '../services/mapper.service';
import { MapperTreeNode } from '../models';

@Component({
  selector: 'flogo-mapper-input-list',
  templateUrl: 'input-list.component.html',
  styleUrls: ['input-list.component.css'],
})
export class InputListComponent implements OnInit {
  @Input() searchPlaceholder: string;
  filteredNodes$: Observable<MapperTreeNode[]>;
  selectedInput$: Observable<MapperTreeNode>;
  filterTerm$: Observable<string>;

  constructor(private mapperService: MapperService) {}

  ngOnInit() {
    const mapperState$ = this.mapperService.state$.pipe(shareReplay());
    this.filterTerm$ = mapperState$.pipe(selectInputFilter);
    this.filteredNodes$ = mapperState$.pipe(selectFilteredNodes);
    this.selectedInput$ = mapperState$.pipe(selectCurrentNode);
  }

  onInputSelect(node: MapperTreeNode) {
    this.mapperService.selectInput(node);
  }

  onInputSearch(searchTerm: string) {
    this.mapperService.filterInputs(searchTerm);
  }
}
