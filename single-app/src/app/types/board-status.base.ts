import { isOutrange } from '../util/util';
import { OutputBoard } from './output-board.type';
import {
  BoardStatus,
  BoardType,
  Direction,
  Hole,
  HoleStatus,
  HoleType,
  Neighbor,
  Position,
  SelectedHole,
} from './type';

export interface BoardStatusInterface {
  position: Position;
  getNeighborPosition(): Neighbor | undefined;
  getNeighborPositions(position: Position): Neighbor[];
  fromBoardStatus(boardStatus: BoardStatusBase): OutputBoard;
  toBoardStatus(isRevert: boolean): BoardStatusBase;
}

export abstract class BoardStatusBase {
  boardType!: BoardType;
  isRevert: boolean;
  holes!: Hole[][];
  firstPegPosition?: Position; // For reserve mode
  selectedPosition?: Position;
  lastPegPosition?: Position; // For calculate the distance between singularity and last peg
  remainingPegCount = 0;
  jumpablePegCount = 0;
  maxWidth: number;
  height: number;

  constructor(
    holesStatus: Hole[][],
    isRevert: boolean,
    singularityPosition?: Position
  ) {
    this.isRevert = isRevert;
    this.holes = holesStatus;
    this.firstPegPosition = singularityPosition;
    this.maxWidth = Math.max(this.holes?.[0].length, this.holes?.[1].length);
    this.height = this.holes.length;
  }

  abstract getNeighborPositions(position: Position): Neighbor[];
  abstract getDirection(dx: number, dy: number): Direction;

  getNeighborPosition(
    position: Position,
    direction: Direction,
    neighbors?: Neighbor[]
  ): Neighbor | undefined {
    const values = neighbors ?? this.getNeighborPositions(position);
    return values.find((value) => value.direction === direction);
  }

  toBoard(boardStatus: BoardStatus): OutputBoard {
    const holeArray = boardStatus.holesStatus;
    const singluarityPosition = boardStatus.firstPegPosition;
    const map = holeArray.map((row, y) => {
      return row.map((cell, x) => {
        if (cell.type === HoleType.temp) {
          return HoleType.none;
        } else {
          return cell.type;
        }
      });
    });
    return new OutputBoard(map, this.boardType, singluarityPosition);
  }

  getHole(position: Position): Hole | undefined {
    let result;
    if (!isOutrange(position, this.holes)) {
      result = this.holes[position.row][position.col];
    }
    return result;
  }

  hasPeg(position: Position): boolean {
    const hole = this.getHole(position);
    if (hole) {
      return hole.type >= HoleType.one;
    }
    return false;
  }

  updateStatus(selected?: Position): Position | undefined {
    let jumpablePegCount = 0;
    let remainingPegCount = 0;
    let lastPegPosition;
    // Initialize status
    for (let row = 0; row < this.holes.length; row++) {
      for (let col = 0; col < this.holes[row].length; col++) {
        const position = new Position(col, row);
        const hole = this.getHole(position)!;
        remainingPegCount += hole.type > HoleType.empty ? hole.type : 0;
        const neighborPositions = this.getNeighborPositions(position);
        const jumpable = neighborPositions.some(
          (neighbor: { bypass: Position; target: Position }) => {
            const bypassType = this.getHole(neighbor.bypass)!.type;
            const targetType = this.getHole(neighbor.target)!.type;
            if (
              hole.type > HoleType.empty &&
              bypassType > HoleType.empty &&
              targetType === HoleType.empty
            ) {
              return true;
            }
            return false;
          }
        );
        if (jumpable) {
          hole.status = HoleStatus.jumpable;
          jumpablePegCount += 1;
        } else {
          hole.status = HoleStatus.normal;
        }
      }
    }
    // Update selected position
    let position;
    if (selected && this.hasPeg(selected)) {
      const hole = this.getHole(selected)!;
      hole.status =
        hole.status === HoleStatus.jumpable
          ? HoleStatus.selectedJumpable
          : HoleStatus.selectedUnjumpable;
      if (remainingPegCount === 1) {
        lastPegPosition = new Position(selected.col, selected.row);
      } else {
        const neighborPositions = this.getNeighborPositions(selected);
        neighborPositions.forEach(
          (neighbor: { bypass: Position; target: Position }) => {
            const bypass = this.getHole(neighbor.bypass)!;
            const target = this.getHole(neighbor.target)!;
            if (
              bypass.type > HoleType.empty &&
              target.type === HoleType.empty
            ) {
              target.status = HoleStatus.target;
            }
          }
        );
      }
      position = selected;
    }
    this.remainingPegCount = remainingPegCount;
    this.jumpablePegCount = jumpablePegCount;
    this.lastPegPosition = lastPegPosition;
    return position;
  }

  move(neighbor: Neighbor, selected: Position, reverse: boolean): boolean {
    const start = this.getHole(selected)!;
    const bypass = this.getHole(neighbor.bypass)!;
    const target = this.getHole(neighbor.target)!;
    let result = false;
    if (reverse) {
      if (
        start.type > HoleType.empty &&
        bypass.type >= HoleType.empty &&
        target.type >= HoleType.empty
      ) {
        start.type = start.type - 1;
        bypass.type = bypass.type + 1;
        target.type = target.type + 1;
        result = true;
      }
    } else {
      if (
        start.type > HoleType.empty &&
        bypass.type > HoleType.empty &&
        target.type === HoleType.empty
      ) {
        start.type = start.type - 1;
        bypass.type = bypass.type - 1;
        target.type = target.type + 1;
        result = true;
      }
    }
    return result;
  }
}
