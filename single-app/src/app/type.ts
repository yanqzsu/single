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

export class Position {
  private readonly invalidIndex = -1;
  col: number;
  row: number;

  constructor(col?: number, row?: number) {
    this.col = col ?? this.invalidIndex;
    this.row = row ?? this.invalidIndex;
  }
  isSame(position: Position): boolean {
    return this.col === position.col && this.row === position.row;
  }

  validate(): boolean {
    return (
      !!this.col &&
      this.col > this.invalidIndex &&
      !!this.row &&
      this.row > this.invalidIndex
    );
  }
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
