import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BOARD_LIST } from 'src/app/board-list';
import { Board, BoardStatus } from '../../board.type';
import {
  BoardType,
  Direction,
  Hole,
  HoleStatus,
  HoleType,
  Neighbor,
  Operation,
  Position,
} from '../../type';

@Injectable({
  providedIn: 'root',
})
export class AboardService {
  private MAX_ROW = 7;
  private MAX_COLUMN = 7;
  private _board!: Board;
  private holesStatus!: Hole[][];
  private operationStack: Operation[] = [];
  private selectedPosition: Position = new Position();
  private boardStatusSubject = new ReplaySubject<BoardStatus>(1);
  boardStatus$: Observable<BoardStatus>;

  constructor() {
    this.boardStatus$ = this.boardStatusSubject.asObservable();
    // random board for test
    this.board = BOARD_LIST['triangleBoard'] as Board;
  }

  set board(board: Board) {
    this._board = board;
    // this.expandBoard();
    this.initBoardStatus();
    this.updateStatus();
  }

  get board(): Board {
    return this._board;
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
    const boardStatus: BoardStatus = {
      remainingPegCount,
      jumpablePegCount,
      lastPegPosition,
      holeStatus: this.deepClone<Hole[][]>(this.holesStatus),
      board: this.board,
      operationStack: this.operationStack,
    };
    this.boardStatusSubject.next(boardStatus);
  }

  drag(reverse: boolean, direction: Direction): boolean {
    const endPosition = this.board.getNeighborPosition(
      this.selectedPosition,
      direction
    );
    if (endPosition) {
      return this.move(endPosition, this.selectedPosition, reverse);
    }
    return false;
  }

  click(
    reverse: boolean,
    endPosition: Position,
    startPosition?: Position
  ): boolean {
    const position = startPosition || this.selectedPosition;
    if (position.isSame(endPosition)) {
      this.updateStatus(endPosition);
      return false;
    }
    if (this.hasPeg(position) && !this.board.isOutrange(endPosition)) {
      const neighborPositions = this.board.getNeighborPositions(position);
      const neighbor = neighborPositions.find((neighbor) =>
        neighbor.target.isSame(endPosition)
      );
      if (neighbor) {
        return this.move(neighbor, position, reverse);
      }
    }
    return false;
  }

  undo(): void {
    const operation = this.operationStack.pop();
    if (operation) {
      this.click(true, operation.source, operation.target);
    }
  }

  hasPeg(position: Position): boolean {
    const hole = this.getHole(position);
    if (hole) {
      return hole.type > HoleType.empty;
    }
    return false;
  }

  getHole(position: Position): Hole | undefined {
    let result;
    if (!this.board.isOutrange(position)) {
      result = this.holesStatus[position.row][position.col];
    }
    return result;
    // return this.holesStatus[position.row][position.col];
  }

  setSelectedPosition(position: Position, refreshStatus?: boolean): void {
    if (this.hasPeg(position)) {
      this.selectedPosition = position;
    }
    if (refreshStatus) {
      this.updateStatus(this.selectedPosition);
    }
  }

  getDirection(dx: number, dy: number): Direction | undefined {
    return this._board?.getDirection(dx, dy);
  }

  private move(
    neighbor: Neighbor,
    selected: Position,
    reverse: boolean
  ): boolean {
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
        this.operationStack.push({
          source: selected,
          target: neighbor.target,
        });
        result = true;
      }
    }
    if (result) {
      this.selectedPosition = neighbor.target;
      this.updateStatus(this.selectedPosition);
    }
    return result;
  }

  private deepClone<T>(obj: T): T {
    // return obj.map((row) => row.slice());
    return JSON.parse(JSON.stringify(obj));
  }

  private initBoardStatus(): void {
    const holesStatus: Hole[][] = this.board.map.map((row: any[]) => {
      return row.map((value: any) => {
        return {
          type: value,
          status: HoleStatus.normal,
        };
      });
    });
    this.holesStatus = holesStatus;
    this.operationStack = [];
  }

  private shrinkBoard(): void {}

  private expandBoard(): void {
    const edge = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      innerWidth: this.board.width,
      innerHeight: this.board.height,
    };
    this.board.map.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell > HoleType.empty) {
          const neighbors = this.board.getNeighborPositions(
            new Position(colIndex, rowIndex),
            true
          );
          neighbors.forEach((neighbor) => {
            const position = neighbor.target;
            if (position.col < edge.left) {
              edge.left = position.col;
            }
            if (position.col > edge.right) {
              edge.right = position.col;
            }
            if (position.row < edge.top) {
              edge.top = position.row;
            }
            if (position.row > edge.bottom) {
              edge.bottom = position.row;
            }
          });
        }
        if (cell === HoleType.none) {
          this.board.map[rowIndex][colIndex] = HoleType.temp;
        }
      });
    });
    console.log(edge);
    while (edge.top < 0) {
      const firstRowLength = this.board.map[0].length;
      if (this.board.boardType === BoardType.hexagon) {
        if (firstRowLength !== edge.innerWidth) {
          const newRow = [
            HoleType.half,
            ...Array(edge.innerWidth - 2).fill(HoleType.temp),
            HoleType.half,
          ];
          this.board.map.unshift(newRow);
        } else {
          this.board.map.unshift(
            Array(edge.innerWidth - 1).fill(HoleType.temp)
          );
        }
      } else {
        this.board.map.unshift(Array(firstRowLength).fill(HoleType.temp));
      }
      edge.top++;
      this.board.updateSize();
    }
    while (edge.bottom - edge.innerHeight >= 0) {
      const lastRowLength = this.board.map[this.board.height - 1].length;
      if (this.board.boardType === BoardType.hexagon) {
        if (lastRowLength !== edge.innerWidth) {
          const newRow = [
            HoleType.half,
            ...Array(edge.innerWidth - 2).fill(HoleType.temp),
            HoleType.half,
          ];
          this.board.map.push(newRow);
        } else {
          this.board.map.push(Array(edge.innerWidth - 1).fill(HoleType.temp));
        }
      } else {
        this.board.map.push(Array(lastRowLength).fill(HoleType.temp));
      }
      edge.bottom--;
      this.board.updateSize();
    }
    while (edge.left < 0) {
      this.board.map.forEach((row) => {
        if (this.board.boardType === BoardType.hexagon) {
          const firstCell = row[0];
          if (firstCell === HoleType.half) {
            row[0] = HoleType.temp;
            row.unshift(HoleType.half);
          } else {
            row.unshift(HoleType.temp);
          }
        } else {
          row.unshift(HoleType.temp);
        }
      });
      edge.left++;
    }
    while (edge.right - edge.innerWidth >= -1) {
      this.board.map.forEach((row) => {
        if (this.board.boardType === BoardType.hexagon) {
          const lastCell = row[row.length - 1];
          if (lastCell === HoleType.half) {
            row[row.length - 1] = HoleType.temp;
            row.push(HoleType.half);
          } else {
            row.push(HoleType.temp);
          }
        } else {
          row.push(HoleType.temp);
        }
      });
      edge.right--;
    }
  }
}
