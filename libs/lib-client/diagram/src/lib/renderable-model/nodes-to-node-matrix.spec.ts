import { isEqual } from 'lodash';
import { GraphNode, GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';
import { nodesToNodeMatrix } from './nodes-to-node-matrix';
import { fromPairs } from 'lodash';
import { NodeMatrix } from './matrix';
// Test should render this tree:
// A1⟶B1⟶C1
// |   |   ├──D2
// |   |   └──E3
// |   └──C5
// └── B6⟶C6
// |   └──C7
// └──B8
function makeTestData(): {
  root: GraphNode;
  nodeDictionary: GraphNodeDictionary;
} {
  const nodes = [
    {
      id: 'root',
      type: NodeType.Task,
      parents: [],
      children: ['B1', 'L-root-B6', 'L-root-B8'],
      features: {},
    },
    {
      id: 'B1',
      type: NodeType.Task,
      parents: ['root'],
      children: ['C1', 'L-B1-C5'],
      features: {},
    },
    {
      id: 'C1',
      type: NodeType.Task,
      parents: ['B1'],
      children: ['L-C1-D2'],
      features: {},
    },
    {
      id: 'D2',
      type: NodeType.Task,
      parents: ['L-C1-D2'],
      children: ['L-D2-E3', 'L-D2-E4'],
      features: {},
    },
    {
      id: 'E3',
      type: NodeType.Task,
      parents: ['L-D2-E3'],
      children: [],
      features: {},
    },
    {
      id: 'E4',
      type: NodeType.Task,
      parents: ['L-D2-E4'],
      children: [],
      features: {},
    },
    {
      id: 'C5',
      type: NodeType.Task,
      parents: ['L-B1-C5'],
      children: [],
      features: {},
    },
    {
      id: 'B6',
      type: NodeType.Task,
      parents: ['L-root-C6'],
      children: ['C6', 'L-B6-C7'],
      features: {},
    },
    {
      id: 'C6',
      type: NodeType.Task,
      parents: ['B6'],
      children: [],
      features: {},
    },
    {
      id: 'C7',
      type: NodeType.Task,
      parents: ['L-B6-C7'],
      children: [],
      features: {},
    },
    {
      id: 'B8',
      type: NodeType.Task,
      parents: ['L-root-B8'],
      children: [],
      features: {},
    },
    {
      id: 'L-root-B6',
      type: NodeType.Branch,
      parents: ['root'],
      children: ['B6'],
      features: {},
    },
    {
      id: 'L-root-B8',
      type: NodeType.Branch,
      parents: ['root'],
      children: ['B8'],
      features: {},
    },
    {
      id: 'L-B6-C7',
      type: NodeType.Branch,
      parents: ['B6'],
      children: ['C7'],
      features: {},
    },
    {
      id: 'L-B1-C5',
      type: NodeType.Branch,
      parents: ['B1'],
      children: ['C5'],
      features: {},
    },
    {
      id: 'L-C1-D2',
      type: NodeType.Branch,
      parents: ['C1'],
      children: ['D2'],
      features: {},
    },
    {
      id: 'L-D2-E3',
      type: NodeType.Branch,
      parents: ['D2'],
      children: ['E3'],
      features: {},
    },
    {
      id: 'L-D2-E4',
      type: NodeType.Branch,
      parents: ['D2'],
      children: ['E4'],
      features: {},
    },
  ];
  const nodeDictionary: GraphNodeDictionary = fromPairs(
    nodes.map(node => [node.id, { ...node, capabilities: {}, status: {} }])
  );
  const { root } = nodeDictionary;
  return { root, nodeDictionary };
}

describe('diagram.nodesToNodeMatrix', function() {
  it('correctly generates a node matrix from nodes info', function() {
    const { root, nodeDictionary } = makeTestData();
    const result = nodesToNodeMatrix(root, nodeDictionary);
    const expectedMatrix = [
      ['root', 'B1', 'C1'],
      [null, null, 'L-C1-D2', 'D2'],
      [null, null, null, 'L-D2-E3', 'E3'],
      [null, null, null, 'L-D2-E4', 'E4'],
      [null, 'L-B1-C5', 'C5'],
      ['L-root-B6', 'B6', 'C6'],
      [null, 'L-B6-C7', 'C7'],
      ['L-root-B8', 'B8'],
    ];
    expect(result)['toMatchNodeMatrix'](expectedMatrix);
  });
  beforeAll(function() {
    jasmine.addMatchers({
      toMatchNodeMatrix: (
        util: jasmine.MatchersUtil,
        customEqualityTesters: Array<jasmine.CustomEqualityTester>
      ) => {
        return {
          compare: (
            actualMatrix: NodeMatrix,
            expectedMatrix: string[][]
          ): jasmine.CustomMatcherResult => {
            const result: jasmine.CustomMatcherResult = {
              pass: false,
              message: '',
            };

            if (actualMatrix.length !== expectedMatrix.length) {
              result.message = `Actual matrix has different row count than expected.
               Actual: ${actualMatrix.length}, expected: ${expectedMatrix.length}`;
              return result;
            }

            const extractNodeId = node => (node ? node.id : null);
            for (let i = 0; i < actualMatrix.length; i++) {
              const actualValues = actualMatrix[i].map(extractNodeId);
              const expectedValues = expectedMatrix[i];
              if (!isEqual(actualValues, expectedValues)) {
                result.message = `Actual row at index ${i} doesn't match expectation.
                  Expected ${JSON.stringify(expectedValues)}. Actual: ${JSON.stringify(
                  actualValues
                )}`;
              }
            }
            result.pass = true;
            result.message = 'Passed';
            return result;
          },
        };
      },
    });
  });
});
