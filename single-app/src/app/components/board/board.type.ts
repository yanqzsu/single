import {
  BoardType,
  Direction,
  Hole,
  HoleType,
  Neighbor,
  Operation,
  Position,
} from '../../type';

export interface BoardStatus {
  board: Board;
  holeStatus: Hole[][];
  jumpablePegCount: number;
  remainingPegCount: number;
  lastPegPosition?: Position;
  operationStack: Operation[];
  selectedPosition?: Position;
}

export class Board {
  map: HoleType[][];
  boardType: BoardType;
  startPosition: Position;
  constructor(
    map: HoleType[][],
    boardType: BoardType,
    startPosition: Position
  ) {
    this.map = map;
    this.boardType = boardType;
    this.startPosition = startPosition;
  }

  getHoleType(position: Position): HoleType {
    return this.map[position.row][position.col];
  }

  isOutrange(position: Position): boolean {
    const rowMax = this.map.length - 1;
    if (position.row < 0 || position.row > rowMax) {
      return true;
    }
    const columnMax = this.map[position.row].length - 1;
    if (position.col < 0 || position.col > columnMax) {
      return true;
    }
    return false;
  }

  getNeighborPosition(
    position: Position,
    direction: Direction,
    neighbors?: Neighbor[]
  ): Neighbor | undefined {
    const values = neighbors ?? this.getNeighborPositions(position);
    return values.find((value) => value.direction === direction);
  }

  getNeighborPositions(position: Position): Neighbor[] {
    const neighbors: Neighbor[] = [];
    const { col, row } = position;
    if (this.boardType === BoardType.rectangular) {
      neighbors.push({
        bypass: new Position(col, row - 1),
        target: new Position(col, row - 2),
        direction: Direction.up,
      });
      neighbors.push({
        bypass: new Position(col, row + 1),
        target: new Position(col, row + 2),
        direction: Direction.down,
      });
      neighbors.push({
        bypass: new Position(col - 1, row),
        target: new Position(col - 2, row),
        direction: Direction.left,
      });
      neighbors.push({
        bypass: new Position(col + 1, row),
        target: new Position(col + 2, row),
        direction: Direction.right,
      });
    } else if (this.boardType === BoardType.diagonalRectangular) {
      neighbors.push({
        bypass: new Position(col, row - 1),
        target: new Position(col, row - 2),
        direction: Direction.up,
      });
      neighbors.push({
        bypass: new Position(col, row + 1),
        target: new Position(col, row + 2),
        direction: Direction.down,
      });
      neighbors.push({
        bypass: new Position(col - 1, row),
        target: new Position(col - 2, row),
        direction: Direction.left,
      });
      neighbors.push({
        bypass: new Position(col + 1, row),
        target: new Position(col + 2, row),
        direction: Direction.right,
      });
      neighbors.push({
        bypass: new Position(col - 1, row - 1),
        target: new Position(col - 2, row - 2),
        direction: Direction.upLeft,
      });
      neighbors.push({
        bypass: new Position(col + 1, row - 1),
        target: new Position(col + 2, row - 2),
        direction: Direction.upRight,
      });
      neighbors.push({
        bypass: new Position(col - 1, row + 1),
        target: new Position(col - 2, row + 2),
        direction: Direction.downLeft,
      });
      neighbors.push({
        bypass: new Position(col + 1, row + 1),
        target: new Position(col + 2, row + 2),
        direction: Direction.downRight,
      });
    } else if (this.boardType === BoardType.triangular) {
      const hasHalf = this.map[position.row][0] === HoleType.half;
      neighbors.push({
        bypass: new Position(col - 1, row),
        target: new Position(col - 2, row),
        direction: Direction.left,
      });
      neighbors.push({
        bypass: new Position(col + 1, row),
        target: new Position(col + 2, row),
        direction: Direction.right,
      });
      if (hasHalf) {
        // left-top
        neighbors.push({
          bypass: new Position(col - 1, row - 1),
          target: new Position(col - 1, row - 2),
          direction: Direction.upLeft,
        });
        // right-top
        neighbors.push({
          bypass: new Position(col, row - 1),
          target: new Position(col + 1, row - 2),
          direction: Direction.upRight,
        });
        // left-bottom
        neighbors.push({
          bypass: new Position(col - 1, row + 1),
          target: new Position(col - 1, row + 2),
          direction: Direction.downLeft,
        });
        // right-bottom
        neighbors.push({
          bypass: new Position(col, row + 1),
          target: new Position(col + 1, row + 2),
          direction: Direction.downRight,
        });
      } else {
        // left-top
        neighbors.push({
          bypass: new Position(col, row - 1),
          target: new Position(col - 1, row - 2),
          direction: Direction.upLeft,
        });
        // right-top
        neighbors.push({
          bypass: new Position(col + 1, row - 1),
          target: new Position(col + 1, row - 2),
          direction: Direction.upRight,
        });
        // left-bottom
        neighbors.push({
          bypass: new Position(col, row + 1),
          target: new Position(col - 1, row + 2),
          direction: Direction.downLeft,
        });
        // right-bottom
        neighbors.push({
          bypass: new Position(col + 1, row + 1),
          target: new Position(col + 1, row + 2),
          direction: Direction.downRight,
        });
      }
    }
    return neighbors.filter(
      (value) =>
        !this.isOutrange(value.bypass) && !this.isOutrange(value.target)
    );
  }

  getDirection(dx: number, dy: number): Direction | undefined {
    let direction;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (
      this.boardType === BoardType.rectangular &&
      Math.max(absDx, absDy) > 10
    ) {
      direction =
        absDx > absDy
          ? dx > 0
            ? Direction.right
            : Direction.left
          : dy > 0
          ? Direction.down
          : Direction.up;
    } else if (
      this.boardType === BoardType.diagonalRectangular &&
      Math.max(absDx, absDy) > 10
    ) {
      const radio = absDx / absDy;
      if (radio > 2 || radio < 0.5) {
        direction =
          absDx > absDy
            ? dx > 0
              ? Direction.right
              : Direction.left
            : dy > 0
            ? Direction.down
            : Direction.up;
      } else {
        direction =
          dx > 0
            ? dy > 0
              ? Direction.downRight
              : Direction.upRight
            : dy > 0
            ? Direction.downLeft
            : Direction.upLeft;
      }
    } else if (
      this.boardType === BoardType.triangular &&
      Math.max(absDx, absDy) > 10
    ) {
      const radio = absDx / absDy;
      if (radio > 2) {
        direction = dx > 0 ? Direction.right : Direction.left;
      } else {
        direction =
          dx > 0
            ? dy > 0
              ? Direction.downRight
              : Direction.upRight
            : dy > 0
            ? Direction.downLeft
            : Direction.upLeft;
      }
    }
    return direction;
  }
}

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
    BoardType.diagonalRectangular,
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
    BoardType.diagonalRectangular,
    new Position(3, 3)
  ),

  triangleBoard: new Board(
    [
      [-1, -1, 0, -1, -1],
      [-0.5, -1, 1, 1, -1, -0.5],
      [-1, 1, 1, 1, -1],
      [-0.5, 1, 1, 1, 1, -0.5],
      [1, 1, 1, 1, 1],
    ],
    BoardType.triangular,
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
    BoardType.triangular,
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
    BoardType.triangular,
    new Position(3, 4)
  ),
};
