import { times } from 'lodash';

import { GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';

import { Tile } from '../interfaces';
import { NodeMatrix, TileMatrix } from './matrix';
import { tileFactory } from './tile-factory';

const TILE_PADDING = tileFactory.makePadding();
const TILE_PLACEHOLDER = tileFactory.makePlaceholder();
const fillWithPlaceholders = (fromCount: number, max: number) =>
  times(max - fromCount, () => TILE_PLACEHOLDER);

// assumes that the rows won't overflow
// and the overflow case should be handled somewhere else.
export function createTileMatrix(
  nodeMatrix: NodeMatrix,
  nodes: GraphNodeDictionary,
  maxRowLength,
  isReadOnly = false
): TileMatrix {
  const maxTileIndex = maxRowLength - 1;
  const nodeToTile = (node, index) => {
    let hasBranch = false;
    if (!!node) {
      hasBranch = !!node.children.find(child => nodes[child].type === NodeType.Branch);
      return {
        ...tileFactory.makeTask(node, index >= maxTileIndex, node.parents[0]),
        hasBranch: hasBranch,
      };
    } else {
      return TILE_PADDING;
    }
  };
  return nodeMatrix.map(rowOfNodes => {
    if (rowOfNodes.length <= 0) {
      return [];
    }
    const rowOfTiles: Tile[] = rowOfNodes.map(nodeToTile);
    const lastNode = rowOfNodes[rowOfNodes.length - 1];
    const isInsertAllowed = lastNode.features && lastNode.features.canHaveChildren;
    if (!isReadOnly && isInsertAllowed && rowOfTiles.length < maxRowLength) {
      return makeRowExtensible(rowOfTiles, lastNode.id, maxRowLength);
    }
    return rowOfTiles;
  });
}

function makeRowExtensible(rowOfTiles: Tile[], lastNodeId: string, maxRowLength: number) {
  const actionTile = tileFactory.makeInsert(lastNodeId);
  const placeholders = fillWithPlaceholders(rowOfTiles.length + 1, maxRowLength);
  return [...rowOfTiles, actionTile, ...placeholders];
}
