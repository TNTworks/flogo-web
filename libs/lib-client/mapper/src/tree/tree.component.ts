import {
  AfterViewInit,
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

import { MapperTreeNode } from '../models/mapper-treenode.model';
import { DraggingService } from '../services/dragging.service';

@Component({
  selector: 'flogo-mapper-tree',
  templateUrl: 'tree.component.html',
  styleUrls: ['tree.component.less'],
})
export class TreeComponent implements OnChanges, AfterViewInit {
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

  private selectedBranch: MapperTreeNode[] | null;

  constructor(
    private draggingService: DraggingService,
    private iconsService: IconsService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected'] && this.selected) {
      this.selectedBranch = this.extractNodePath(this.selected);
    }

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

  onSelect(event: { node: MapperTreeNode }) {
    const node = event.node;
    if (node && node.isSelectable) {
      this.select.emit(node);
    }
  }

  onCategoryExpand(event: any) {
    this.updateScrollbars();
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

  private extractNodePath(node: MapperTreeNode): MapperTreeNode[] {
    const path: MapperTreeNode[] = [node];
    let currentNode = node;
    while (currentNode.parent) {
      currentNode = currentNode.parent;
      path.push(currentNode);
    }
    return path;
  }

  private updateScrollbars() {
    setTimeout(() => {
      if (this.scrollbars) {
        this.scrollbars.forEach(scrollbar => scrollbar.update());
      }
    }, 0);
  }
}
