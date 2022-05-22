import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { PerfectScrollbarDirective as ScrollbarDirective } from 'ngx-perfect-scrollbar';

import { MapperIconsService as IconsService } from '@flogo-web/lib-client/mapper-icons';

import { MapperTreeNode } from '../models';
import { DraggingService } from '../services/dragging.service';

@Component({
  selector: 'flogo-mapper-list',
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnChanges, AfterViewInit {
  @Input() treeNodes: MapperTreeNode[];
  @Input() searchTerm = '';
  @Input() searchPlaceholder = 'Search';
  @Input() selected: MapperTreeNode | null;
  @Input() dragType: string;

  @Output() hover: EventEmitter<MapperTreeNode> = new EventEmitter<MapperTreeNode>();
  @Output() leave: EventEmitter<any> = new EventEmitter<any>();
  @Output() select: EventEmitter<MapperTreeNode> = new EventEmitter<MapperTreeNode>();
  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  @ViewChildren(ScrollbarDirective) scrollbars: QueryList<ScrollbarDirective>;

  constructor(
    private draggingService: DraggingService,
    private iconsService: IconsService
  ) {}

  trackNodeByFn(index, node: MapperTreeNode) {
    return node.path;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchTerm']) {
      this.searchTerm = this.searchTerm || '';
    }

    if (changes['treeNodes']) {
      this.updateScrollbars();
    }
  }

  ngAfterViewInit() {
    this.updateScrollbars();
  }

  onSelect(node: MapperTreeNode) {
    if (node && node.isSelectable) {
      this.select.emit(node);
    }
  }

  onMouseHover(event) {
    this.hover.emit(event);
  }

  onMouseLeave(event) {
    this.leave.emit(event);
  }

  onDragStart(event, node) {
    event.dataTransfer.setData('data', node.path);
    this.draggingService.dragStart(this.dragType, node);
  }

  getIcon(node: MapperTreeNode) {
    return this.iconsService.getIcon(node);
  }

  clearSearch() {
    this.search.emit('');
  }

  onSearchChange(term: string) {
    this.search.emit(term);
  }

  private updateScrollbars() {
    setTimeout(() => {
      if (this.scrollbars) {
        this.scrollbars.forEach(scrollbar => scrollbar.update());
      }
    }, 0);
  }
}
