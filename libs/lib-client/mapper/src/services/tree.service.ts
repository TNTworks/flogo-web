import { Injectable } from '@angular/core';
import { MapperTreeNode } from '../models';

const addClass = function(classes: string[], value: string) {
  if (classes.indexOf(value) === -1) {
    classes.unshift(value);
  }
};

const removeClass = function(classes: string[], value: string) {
  const index = classes.indexOf(value);
  if (index > -1) {
    classes.splice(index, 1);
  }
};

const CLASSES = {
  selected: 'node--is-selected',
  hasMapping: 'node--has-expression',
  visible: 'node--visible',
  invalid: 'node--has-errors',
  isFilterMatch: 'node--is-filter-match',
};

@Injectable()
export class TreeService {
  selectNode(nodes: MapperTreeNode[], selectedPath: string): MapperTreeNode[] {
    const Visitor = function() {
      this.visitNode = function(node: MapperTreeNode) {
        const classes = (node.styleClass || '').trim().split(' ');
        const selectedClass = CLASSES.selected;

        if (node.path === selectedPath) {
          addClass(classes, selectedClass);
        } else {
          removeClass(classes, selectedClass);
        }
        node.styleClass = classes.join(' ');
      };
    };
    const visitor = new Visitor();

    nodes.forEach((node: MapperTreeNode) => this.visitChildren(node, visitor));
    return nodes;
  }

  traverseChildren(node: MapperTreeNode, onChild: (node: MapperTreeNode) => void) {
    if (node.children && node.children.length) {
      node.children.forEach((child: MapperTreeNode) => {
        onChild(child);
        this.traverseChildren(child, onChild);
      });
    }
  }

  applyFilter(
    nodes: MapperTreeNode[],
    searchText: string = null,
    selectedPath: string = null
  ) {
    const searchTextLower = searchText ? searchText.toLowerCase() : '';
    const isMatch = (node: MapperTreeNode) => {
      const nodeLabel = node && node.label ? node.label.toLowerCase() : node.label;
      return searchTextLower && nodeLabel.indexOf(searchTextLower) !== -1;
    };
    nodes.forEach(node => this.applyFilterToNode(node, isMatch, selectedPath));
    return nodes;
  }

  extractArrayParents(node: MapperTreeNode): MapperTreeNode[] {
    const arrays = [];
    this.traverseParents(node, (parent: MapperTreeNode) => {
      if (parent.dataType === 'array') {
        arrays.unshift(parent);
      }
    });
    return arrays;
  }

  public updateTreeMappingStatus(node: MapperTreeNode): boolean {
    const hasExpression = this.isMappedNode(node);

    let hasMappedChild = false;
    if (node.children) {
      hasMappedChild = node.children.reduce(
        (hasMappings, childNode) =>
          this.updateTreeMappingStatus(childNode) || hasMappings,
        false
      );
    }

    const hasMapping = hasExpression || hasMappedChild;
    this.updateStyleClass(node, {
      [CLASSES.hasMapping]: hasMapping,
      [CLASSES.invalid]: node.isInvalid,
    });
    return hasMapping;
  }

  public propagateMappingStatusToParents(
    node: MapperTreeNode,
    callingChildHasMapping: boolean = false
  ) {
    let hasMapping = this.isMappedNode(node) || callingChildHasMapping;
    if (!hasMapping && node.children) {
      hasMapping = node.children.some(child => this.isMappedNode(child));
    }

    this.updateStyleClass(node, {
      [CLASSES.hasMapping]: hasMapping,
      [CLASSES.invalid]: node.isInvalid,
    });
    if (node.parent) {
      this.propagateMappingStatusToParents(node.parent, hasMapping);
    }
  }

  private applyFilterToNode(
    node: MapperTreeNode,
    matchDiscriminator: (node: MapperTreeNode) => boolean,
    selectedPath = null
  ) {
    const isMatch = matchDiscriminator(node);
    let hasVisibleChild = false;
    if (node.children) {
      hasVisibleChild = node.children.reduce(
        (foundVisibleChild: boolean, childNode) =>
          this.applyFilterToNode(childNode, matchDiscriminator, selectedPath) ||
          foundVisibleChild,
        false
      );
    }

    const isVisible = isMatch || hasVisibleChild || node.path === selectedPath;
    node.expanded = isVisible;
    node.isVisible = isVisible;
    this.updateStyleClass(node, {
      [CLASSES.visible]: isVisible,
      [CLASSES.isFilterMatch]: isMatch,
    });
    return isVisible;
  }

  private isMappedNode(node: MapperTreeNode) {
    if (!node || !node.data) {
      return false;
    }
    const expression = node.data.expression;
    return expression && expression.trim();
  }

  private updateStyleClass(
    node: MapperTreeNode,
    classMap: { [className: string]: boolean }
  ) {
    const currentClasses: string[] = (node.styleClass || '').trim().split(' ');
    Object.keys(classMap).forEach(className => {
      if (classMap[className]) {
        addClass(currentClasses, className);
      } else {
        removeClass(currentClasses, className);
      }
    });
    node.styleClass = currentClasses.join(' ');
  }

  private visitChildren(node: MapperTreeNode, visitor: any): MapperTreeNode {
    if (visitor && visitor.visitNode) {
      visitor.visitNode(node);
    }

    if (node.children && node.children.length) {
      node.children.forEach(children => {
        const childrenResult = this.visitChildren(children, visitor);
        if (visitor && visitor.visitNodeStack) {
          visitor.visitNodeStack({ stackNode: node, childrenResult });
        }
      });
    }

    return node;
  }

  private traverseParents(
    node: MapperTreeNode,
    onParent: (node: MapperTreeNode) => void
  ) {
    let parent = node ? node.parent : null;
    while (parent) {
      onParent(parent);
      parent = parent.parent;
    }
  }
}
