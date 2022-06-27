import { Board } from './board.type';
import { Hole, Position, Operation, HoleStatus, HoleType } from './type';
import { deepClone } from './util/util';

/**
 * BoardStatus for painting
 */
export class BoardStatus {
  board: Board;
  holesStatus!: Hole[][];
  jumpablePegCount: number = 0;
  remainingPegCount: number;
  lastPegPosition?: Position;
  operationStack: Operation[];
  selectedPosition?: Position;
  isRevert: boolean;
  displayLimit!: { left: number; right: number; top: number; bottom: number };

  constructor(board: Board, isRevert: boolean) {
    this.board = board;
    this.jumpablePegCount = 0;
    this.remainingPegCount = 0;
    this.operationStack = [];
    this.selectedPosition = undefined;
    this.isRevert = isRevert;
  }

  isOutrange(position: Position): boolean {
    const rowMax = this.holesStatus.length - 1;
    if (position.row < 0 || position.row > rowMax) {
      return true;
    }
    const columnMax = this.holesStatus[position.row].length - 1;
    if (position.col < 0 || position.col > columnMax) {
      return true;
    }
    return false;
  }

  getHoleType(position: Position): HoleType {
    return this.board.map[position.row][position.col];
  }

  getHole(position: Position): Hole | undefined {
    let result;
    if (!this.isOutrange(position)) {
      result = this.holesStatus[position.row][position.col];
    }
    return result;
  }

  updateStatus(selected?: Position): void {
    let jumpablePegCount = 0;
    let remainingPegCount = 0;
    let lastPegPosition;
    for (let row = 0; row < this.holesStatus.length; row++) {
      for (let col = 0; col < this.holesStatus[row].length; col++) {
        const position = new Position(col, row);
        const hole = this.getHole(position)!;
        remainingPegCount += hole.type > HoleType.empty ? hole.type : 0;
        const neighborPositions = this.board.getNeighborPositions(position);
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
    if (selected && this.hasPeg(selected)) {
      const hole = this.getHole(selected)!;
      hole.status =
        hole.status === HoleStatus.jumpable
          ? HoleStatus.selectedJumpable
          : HoleStatus.selectedUnjumpable;
      if (remainingPegCount === 1) {
        lastPegPosition = new Position(selected.col, selected.row);
      } else {
        const neighborPositions = this.board.getNeighborPositions(selected);
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
    }
    this.remainingPegCount = remainingPegCount;
    this.jumpablePegCount = jumpablePegCount;
    this.lastPegPosition = lastPegPosition;
    this.holesStatus = deepClone<Hole[][]>(this.holesStatus);
  }

  private initBoardStatus(): void {
    const limit = {
      left: 0,
      right: this.board.width - 1,
      top: 0,
      bottom: this.board.height - 1,
    };
    const holesStatus: Hole[][] = this.board.map.map(
      (row: HoleType[], rowIndex: number) => {
        return row.map((value: HoleType, colIndex) => {
          return {
            type:
              this.isRevert && value === HoleType.none ? HoleType.temp : value,
            status: HoleStatus.normal,
          };
        });
      }
    );
    this.holesStatus = holesStatus;
    this.operationStack = [];
  }
}
