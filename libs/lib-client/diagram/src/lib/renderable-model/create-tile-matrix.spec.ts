import objectContaining = jasmine.objectContaining;
import ObjectContaining = jasmine.ObjectContaining;

import { createTileMatrix } from './create-tile-matrix';
import { GraphNode, NodeType } from '@flogo-web/lib-client/core';
import { InsertTile, TaskTile, Tile, TileType } from '../interfaces';
import { NodeMatrix } from './matrix';

describe('diagram.createTileMatrix', function() {
  it('should create a renderable matrix from a node matrix', function() {
    const result = createTileMatrix(getTestData(), getNodesTestData(), 5);
    const expected: ObjectContaining<Tile>[][] = getExpectedMatrix();
    expect(expected.length).toEqual(
      result.length,
      `Actual matrix has different row count than expected.
               Actual: ${result.length}, expected: ${expected.length}`
    );
    expected.forEach((expectedRow, rowIndex) => {
      const actualRow = result[rowIndex];
      expect(actualRow.length).toEqual(
        expectedRow.length,
        `Length of row ${rowIndex} doesn't match expected length.
               Actual: ${actualRow.length}, expected: ${expectedRow.length}`
      );
      expectRow(actualRow, expectedRow, rowIndex);
    });
  });

  function expectRow(actualRow, expectedRow, rowIndex) {
    expectedRow.forEach((expectedTile, tileIndex) => {
      expect(actualRow[tileIndex]).toEqual(
        expectedTile,
        `For row ${rowIndex} at tile with position ${tileIndex}
      expected ${JSON.stringify(actualRow[tileIndex])} to equal ${JSON.stringify(
          expectedTile
        )}`
      );
    });
  }

  function getTestData(): NodeMatrix {
    return [
      [
        {
          id: 'root',
          type: NodeType.Task,
          parents: [],
          children: ['child1', 'branch1'],
          features: {
            canHaveChildren: true,
            canBranch: true,
          },
          status: {},
        },
        {
          id: 'child1',
          type: NodeType.Task,
          parents: ['root'],
          children: [],
          features: {
            canHaveChildren: false,
            canBranch: true,
          },
          status: {},
        },
      ],
      [
        null,
        {
          id: 'branch1',
          type: NodeType.Branch,
          parents: [],
          children: ['child2'],
          features: {
            canHaveChildren: true,
            canBranch: true,
          },
          status: {},
        },
        {
          id: 'child2',
          type: NodeType.Task,
          parents: [],
          children: [],
          features: {
            canHaveChildren: true,
            canBranch: true,
          },
          status: {},
        },
      ],
    ];
  }

  function getExpectedMatrix(): ObjectContaining<Tile>[][] {
    return [
      [
        objectContaining<TaskTile>({
          type: TileType.Task,
          task: <GraphNode>(<any>objectContaining<GraphNode>({
            id: 'root',
            type: NodeType.Task,
          })),
        }),
        objectContaining<TaskTile>({
          type: TileType.Task,
          task: <GraphNode>(<any>objectContaining<GraphNode>({
            id: 'child1',
            type: NodeType.Task,
          })),
        }),
      ],
      [
        objectContaining<Tile>({
          type: TileType.Padding,
        }),
        objectContaining<TaskTile>({
          type: TileType.Task,
          task: <GraphNode>(<any>objectContaining<GraphNode>({
            id: 'branch1',
            type: NodeType.Branch,
          })),
        }),
        objectContaining<TaskTile>({
          type: TileType.Task,
          task: <GraphNode>(<any>objectContaining<GraphNode>({
            id: 'child2',
            type: NodeType.Task,
          })),
        }),
        objectContaining<InsertTile>({
          type: TileType.Insert,
          parentId: 'child2',
        }),
        objectContaining<Tile>({
          type: TileType.Placeholder,
        }),
      ],
    ];
  }

  function getNodesTestData() {
    return {
      root: {
        id: 'root',
        type: NodeType.Task,
        parents: [],
        children: ['child1', 'branch1'],
        features: {
          canHaveChildren: true,
          canBranch: true,
        },
        status: {},
      },
      child1: {
        id: 'child1',
        type: NodeType.Task,
        parents: ['root'],
        children: [],
        features: {
          canHaveChildren: false,
          canBranch: true,
        },
        status: {},
      },
      branch1: {
        id: 'branch1',
        type: NodeType.Branch,
        parents: [],
        children: ['child2'],
        features: {
          canHaveChildren: true,
          canBranch: true,
        },
        status: {},
      },
      child2: {
        id: 'child2',
        type: NodeType.Task,
        parents: [],
        children: [],
        features: {
          canHaveChildren: true,
          canBranch: true,
        },
        status: {},
      },
    };
  }
});
