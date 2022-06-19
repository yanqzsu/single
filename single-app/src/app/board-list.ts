import { Board } from './board.type';
import { BoardType, Position } from './type';

export const BOARD_LIST: {
  [name: string]: Board | string[];
  list: string[];
} = {
  list: [
    'englishBoard',
    'englishDiagonalBoard',
    'englishDiagonalBoard2',
    'triangleBoard',
    'triangleBoard2',
    'triangleBoard3',
    'triangleBoard4',
  ],
  englishBoard: new Board(
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

  englishDiagonalBoard: new Board(
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

  englishDiagonalBoard2: new Board(
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

  triangleBoard: new Board(
    [
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, 0, -1, -1, -1],
      [-0.5, -1, 1, 1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-0.5, 1, 1, 1, 1, -0.5],
      [1, 1, 1, 1, 1],
      [-1, -1, -1, -1, -1, -1, -1],
    ],
    BoardType.hexagon,
    new Position(2, 0)
  ),

  triangleBoard2: new Board(
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

  triangleBoard3: new Board(
    [
      [-0.5, 1, 1, 1, -0.5],
      [1, 1, 1, 1],
      [-0.5, -1, 1, 1, -0.5],
      [-1, 1, 1, 1],
      [-0.5, -1, -1, 0, -0.5],
    ],
    BoardType.hexagon,
    new Position(3, 4)
  ),

  triangleBoard4: new Board(
    [
      [-1, 1, -1],
      [-0.5, 1, 1, -0.5],
      [1, 1, 1],
    ],
    BoardType.hexagon,
    new Position(3, 4)
  ),
};
