import { GraphNode } from '@flogo-web/lib-client/core';
import { Tile } from '../interfaces';

type Matrix<T> = T[][];
export type NodeMatrix = Matrix<GraphNode | null>;
export type TileMatrix = Matrix<Tile>;
