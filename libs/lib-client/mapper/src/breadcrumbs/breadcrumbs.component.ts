import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MapperIconsService as IconsService } from '@flogo-web/lib-client/mapper-icons';
import { MapperTreeNode } from '../models';

@Component({
  selector: 'flogo-mapper-breadcrumbs',
  templateUrl: 'breadcrumbs.component.html',
  styleUrls: ['breadcrumbs.component.css'],
})
export class BreadcrumbsComponent implements OnChanges {
  @Input() inputNode: MapperTreeNode;
  branch: MapperTreeNode[];

  constructor(private iconsService: IconsService) {}

  ngOnChanges(changes: SimpleChanges) {
    const inputNodeChange = changes['inputNode'];
    if (inputNodeChange && this.inputNode) {
      this.branch = this.extractBranch(this.inputNode);
    }
  }

  getIcon(node: MapperTreeNode) {
    return this.iconsService.getIcon(node);
  }

  private extractBranch(node: MapperTreeNode) {
    const branch = [node];
    while (node.parent) {
      node = node.parent;
      branch.unshift(node);
    }
    return branch;
  }
}
