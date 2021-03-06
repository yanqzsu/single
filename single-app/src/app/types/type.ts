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
  'temp' = 0.5,
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
  private static readonly invalidIndex = -1;
  col: number;
  row: number;

  constructor(col?: number, row?: number) {
    this.col = col ?? Position.invalidIndex;
    this.row = row ?? Position.invalidIndex;
  }

  clone(): Position {
    return new Position(this.col, this.row);
  }

  isSame(position?: Position): boolean {
    return (
      !!position && this.col === position?.col && this.row === position?.row
    );
  }

  validate(): boolean {
    return (
      !!this.col &&
      this.col > Position.invalidIndex &&
      !!this.row &&
      this.row > Position.invalidIndex
    );
  }

  getDistance(p: Position): number {
    const dx = this.col - p.col;
    const dy = this.row - p.row;
    return Math.abs(dx) + Math.abs(dy);
  }
}

export interface Neighbor {
  bypass: Position;
  target: Position;
  direction: Direction;
}

export enum BoardType {
  rectangular = 4,
  octagon = 8,
  hexagon = 6,
}

export interface Operation {
  target: Position;
  source: Position;
}

export interface Edge {
  top: number;
  bottom: number;
  left: number;
  right: number;
  innerWidth: number;
  innerHeight: number;
}

/**
 * BoardStatus for painting
 */
export interface BoardStatus {
  holesStatus: Hole[][];
  jumpablePegCount: number;
  remainingPegCount: number;
  firstPegPosition?: Position;
  lastPegPosition?: Position;
  selectedPosition?: Position;
  selectedDirection?: Direction[];
  isRevert: boolean;
  edge: Edge;
}

export interface ScoreStatus {
  remainingPegCount: number;
  jumpablePegCount: number;
  currentCombo: number;
  maxCombo: number;
  comboCount: number;
  takenCount: number;
  score: number;
  steps: number;
  distance: number;
}
