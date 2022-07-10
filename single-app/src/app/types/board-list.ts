import { OutputBoard } from './output-board';
import { BoardType, Position } from './type';

export const BOARD_LIST: {
  [name: string]: OutputBoard | string[];
  list: string[];
} = {
  list: [
    'englishBoard',
    'englishDiagonalBoard',
    'englishDiagonalBoard2',
    'triangleBoard',
    'triangleBoard2',
    'triangleBoard3',
    'triangleBoard11',
  ],
  englishBoard: new OutputBoard(
    [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ],
    BoardType.rectangular,
    new Position(3, 3)
  ),

  englishDiagonalBoard: new OutputBoard(
    [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ],
    BoardType.octagon,
    new Position(3, 3)
  ),

  englishDiagonalBoard2: new OutputBoard(
    [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 6, 1, 2, 1, 1, 1],
      [1, 1, 2, 0, 2, 1, 1],
      [1, 1, 1, 2, 1, 1, 1],
      [-1, -1, 1, 8, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ],
    BoardType.octagon,
    new Position(3, 3)
  ),

  triangleBoard7: new OutputBoard(
    [
      [-1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, 0, -1, -1, -0.5],
      [-1, -1, 1, 1, -1, -1, -1],
      [-0.5, -1, -1, 1, 1, 1, -1, -0.5],
      [-1, 1, 1, 1, 1, -1, -1],
      [-0.5, -1, 1, 1, 1, 1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, -1, -1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, -1, -1, -1, -0.5],
    ],
    BoardType.hexagon,
    new Position(2, 0)
  ),

  triangleBoard5: new OutputBoard(
    [
      [1, 1, 1, 1, 1],
      [-0.5, 1, 1, 1, 1, -0.5],
      [-1, 1, 1, 1, -1],
      [-0.5, -1, 1, 1, -1, -0.5],
      [-1, -1, 0, -1, -1],
    ],
    BoardType.hexagon,
    new Position(2, 4)
  ),

  triangleBoard10: new OutputBoard(
    [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, 0, -1, -1, -1, -1, -0.5],
      [-1, -1, 1, 1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, 1, 1, 1, -1, -1, -1, -0.5],
      [-1, 1, 1, 1, 1, -1, -1, -1, -1],
      [-0.5, -1, 1, 1, 1, 1, -1, -1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, -1, -1, -1, -1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, -1, -1, -1, -1, -1, -0.5],
    ],
    BoardType.hexagon,
    new Position(3, 4)
  ),
  triangleBoard11: new OutputBoard(
    [
      [-0.5, -1, -1, -1, 0, -1, -1, -1, -1, -1, -0.5],
      [-1, -1, 1, 1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, 1, 1, 1, -1, -1, -1, -1, -0.5],
      [-1, 1, 1, 1, 1, -1, -1, -1, -1, -1],
      [-0.5, -1, 1, 1, 1, 1, -1, -1, -1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, 1],
      [-0.5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -0.5],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-0.5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -0.5],
    ],
    BoardType.hexagon,
    new Position(3, 4)
  ),
};
