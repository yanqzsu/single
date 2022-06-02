export enum Direction {
  up = 1,
  down = 2,
  left = 3,
  right = 4,
  upLeft = 5,
  upRight = 6,
  downLeft = 7,
  downRight = 8,
}

export interface Hole {
  type: HoleType;
  status: HoleStatus;
}

export enum HoleType {
  'half' = -0.5,
  'none' = -1,
  'empty' = 0,
  'one' = 1,
  'two' = 2,
  'three' = 3,
  'four' = 4,
  'five' = 5,
  'six' = 6,
  'seven' = 7,
  'eight' = 8,
  'nine' = 9,
}

export enum HoleStatus {
  'target' = 1, // empty spot
  'jumpable' = 2, // unselected jumpable peg
  'normal' = 3, // normal peg
  'selectedUnjumpable' = 4, // selected & unjumpable peg
  'selectedJumpable' = 5, // selected & jumpable peg
}

export interface Position {
  col: number;
  row: number;
}

export interface Neighbor {
  bypass: Position;
  target: Position;
  direction: Direction;
}

export enum BoardType {
  rectangular = 1,
  diagonalRectangular = 2,
  triangular = 3,
}

export interface BoardStatus {
  board: Board;
  holeStatus: Hole[][];
  jumpablePegCount: number;
}

export class Board {
  map: HoleType[][] = [[0]];
  boardStatus: Hole[][] = [];
  boardType: BoardType;
  startPosition: Position | undefined;
  endPosition: Position | undefined;
  constructor(
    map: HoleType[][],
    boardType: BoardType,
    startPosition?: Position,
    endPosition?: Position
  ) {
    this.map = map;
    this.boardType = boardType;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
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
    return this.getHoleType(position) < 0;
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
        bypass: { col: col, row: row - 1 },
        target: { col: col, row: row - 2 },
        direction: Direction.up,
      });
      neighbors.push({
        bypass: { col: col, row: row + 1 },
        target: { col: col, row: row + 2 },
        direction: Direction.down,
      });
      neighbors.push({
        bypass: { col: col - 1, row },
        target: { col: col - 2, row },
        direction: Direction.left,
      });
      neighbors.push({
        bypass: { col: col + 1, row },
        target: { col: col + 2, row },
        direction: Direction.right,
      });
    } else if (this.boardType === BoardType.diagonalRectangular) {
      neighbors.push({
        bypass: { col: col, row: row - 1 },
        target: { col: col, row: row - 2 },
        direction: Direction.up,
      });
      neighbors.push({
        bypass: { col: col, row: row + 1 },
        target: { col: col, row: row + 2 },
        direction: Direction.down,
      });
      neighbors.push({
        bypass: { col: col - 1, row },
        target: { col: col - 2, row },
        direction: Direction.left,
      });
      neighbors.push({
        bypass: { col: col + 1, row },
        target: { col: col + 2, row },
        direction: Direction.right,
      });
      neighbors.push({
        bypass: { col: col - 1, row: row - 1 },
        target: { col: col - 2, row: row - 2 },
        direction: Direction.upLeft,
      });
      neighbors.push({
        bypass: { col: col + 1, row: row - 1 },
        target: { col: col + 2, row: row - 2 },
        direction: Direction.upRight,
      });
      neighbors.push({
        bypass: { col: col - 1, row: row + 1 },
        target: { col: col - 2, row: row + 2 },
        direction: Direction.downLeft,
      });
      neighbors.push({
        bypass: { col: col + 1, row: row + 1 },
        target: { col: col + 2, row: row + 2 },
        direction: Direction.downRight,
      });
    } else if (this.boardType === BoardType.triangular) {
      const hasHalf = this.map[position.row][0] === HoleType.half;
      neighbors.push({
        bypass: { col: col - 1, row },
        target: { col: col - 2, row },
        direction: Direction.left,
      });
      neighbors.push({
        bypass: { col: col + 1, row },
        target: { col: col + 2, row },
        direction: Direction.right,
      });
      if (hasHalf) {
        // left-top
        neighbors.push({
          bypass: { col: col - 1, row: row - 1 },
          target: { col: col - 1, row: row - 2 },
          direction: Direction.upLeft,
        });
        // right-top
        neighbors.push({
          bypass: { col: col, row: row - 1 },
          target: { col: col + 1, row: row - 2 },
          direction: Direction.upRight,
        });
        // left-bottom
        neighbors.push({
          bypass: { col: col - 1, row: row + 1 },
          target: { col: col - 1, row: row + 2 },
          direction: Direction.downLeft,
        });
        // right-bottom
        neighbors.push({
          bypass: { col: col, row: row + 1 },
          target: { col: col + 1, row: row + 2 },
          direction: Direction.downRight,
        });
      } else {
        // left-top
        neighbors.push({
          bypass: { col: col, row: row - 1 },
          target: { col: col - 1, row: row - 2 },
          direction: Direction.upLeft,
        });
        // right-top
        neighbors.push({
          bypass: { col: col + 1, row: row - 1 },
          target: { col: col + 1, row: row - 2 },
          direction: Direction.upRight,
        });
        // left-bottom
        neighbors.push({
          bypass: { col: col, row: row + 1 },
          target: { col: col - 1, row: row + 2 },
          direction: Direction.downLeft,
        });
        // right-bottom
        neighbors.push({
          bypass: { col: col + 1, row: row + 1 },
          target: { col: col + 1, row: row + 2 },
          direction: Direction.downRight,
        });
      }
    }
    return neighbors.filter(
      (value) =>
        !this.isOutrange(value.bypass) && !this.isOutrange(value.target)
    );
  }
}
