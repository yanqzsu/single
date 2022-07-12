import { isOutrange } from '../../util/util';
import { OutputBoard } from '../output-board';
import {
  BoardStatus,
  BoardType,
  Direction,
  Hole,
  HoleStatus,
  HoleType,
  Neighbor,
  Position,
} from '../type';

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
  lastPegPosition?: Position; // For calculate the distance between singularity and last peg
  remainingPegCount = 0;
  jumpablePegCount = 0;
  maxWidth: number;
  height: number;
  pulral: boolean = false;
  constructor(
    holesStatus: Hole[][],
    isRevert: boolean,
    singularityPosition?: Position,
    pulral?: boolean
  ) {
    this.isRevert = isRevert;
    this.holes = holesStatus;
    this.firstPegPosition = singularityPosition;
    this.maxWidth = Math.max(this.holes?.[0].length, this.holes?.[1].length);
    this.height = this.holes.length;
    this.pulral = !!pulral;
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

  filterNeighbor(neighbor: Neighbor): boolean {
    const bypass = this.getHole(neighbor.bypass)!;
    const target = this.getHole(neighbor.target)!;
    let result = !!bypass && !!target;
    if (!result) {
      return result;
    }
    if (this.isRevert) {
      if (this.pulral) {
        result =
          bypass.type >= HoleType.empty &&
          (target.type === HoleType.empty || target.type === HoleType.temp);
      } else {
        result =
          (bypass.type === HoleType.empty || bypass.type === HoleType.temp) &&
          (target.type === HoleType.empty || target.type === HoleType.temp);
      }
    } else {
      if (this.pulral) {
        result = bypass.type >= HoleType.one && target.type === HoleType.empty;
      } else {
        result = bypass.type === HoleType.one && target.type === HoleType.empty;
      }
    }
    return result;
  }

  updateStatus(selected?: Position): void {
    let jumpablePegCount = 0;
    let remainingPegCount = 0;
    let lastPegPosition;
    // Initialize status
    for (let row = 0; row < this.holes.length; row++) {
      for (let col = 0; col < this.holes[row].length; col++) {
        const position = new Position(col, row);
        const hole = this.getHole(position)!;
        if (hole.type >= HoleType.one) {
          remainingPegCount += hole.type;
          const neighborPositions = this.getNeighborPositions(position);
          if (neighborPositions.length > 0) {
            hole.status = HoleStatus.jumpable;
            jumpablePegCount += 1;
            continue;
          }
        }
        hole.status = HoleStatus.normal;
      }
    }
    //update selected
    if (selected) {
      const hole = this.getHole(selected);
      if (hole && hole.type >= HoleType.one) {
        hole.status =
          hole.status === HoleStatus.jumpable
            ? HoleStatus.selectedJumpable
            : HoleStatus.selectedUnjumpable;
        const neighborPositions = this.getNeighborPositions(selected);
        neighborPositions.forEach((neighbor) => {
          const target = this.getHole(neighbor.target)!;
          if (this.isRevert) {
            target.status = HoleStatus.target;
          } else {
            target.status = HoleStatus.target;
          }
        });
        if (remainingPegCount === 1) {
          lastPegPosition = new Position(selected.col, selected.row);
        }
      }
    }
    this.remainingPegCount = remainingPegCount;
    this.jumpablePegCount = jumpablePegCount;
    this.lastPegPosition = lastPegPosition;
  }

  move(neighbor: Neighbor, selected: Position): boolean {
    const start = this.getHole(selected)!;
    const bypass = this.getHole(neighbor.bypass)!;
    const target = this.getHole(neighbor.target)!;
    let result = false;
    if (this.isRevert) {
      if (this.pulral) {
        start.type = start.type - 1;
        bypass.type = Math.floor(bypass.type) + 1;
        target.type = Math.floor(target.type) + 1;
        result = true;
      } else {
        start.type = HoleType.empty;
        bypass.type = HoleType.one;
        target.type = HoleType.one;
        result = true;
      }
    } else {
      if (this.pulral) {
        start.type = start.type - 1;
        bypass.type = bypass.type - 1;
        target.type = target.type + 1;
        result = true;
      } else {
        start.type = HoleType.empty;
        bypass.type = HoleType.empty;
        target.type = HoleType.one;
        result = true;
      }
    }
    return result;
  }
}
