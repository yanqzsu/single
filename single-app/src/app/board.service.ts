import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import {
  Board,
  BoardStatus,
  BoardType,
  Direction,
  Hole,
  HoleStatus,
  HoleType,
  Position,
} from './type';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  englishBoard = new Board(
    [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ],
    BoardType.rectangular
  );

  englishDiagonalBoard = new Board(
    [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ],
    BoardType.diagonalRectangular
  );

  englishDiagonalBoard2 = new Board(
    [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [1, 6, 1, 2, 1, 1, 1],
      [1, 1, 2, 0, 2, 1, 1],
      [1, 1, 1, 2, 1, 1, 1],
      [-1, -1, 1, 8, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ],
    BoardType.diagonalRectangular
  );

  triangleBoard = new Board(
    [
      [-1, -1, 0, -1, -1],
      [-0.5, -1, 1, 1, -1, -0.5],
      [-1, 1, 1, 1, -1],
      [-0.5, 1, 1, 1, 1, -0.5],
      [1, 1, 1, 1, 1],
    ],
    BoardType.triangular
  );

  triangleBoard2 = new Board(
    [
      [1, 1, 1, 1, 1],
      [-0.5, 1, 1, 1, 1, -0.5],
      [-1, 1, 1, 1, -1],
      [-0.5, -1, 1, 1, -1, -0.5],
      [-1, -1, 0, -1, -1],
    ],
    BoardType.triangular
  );

  triangleBoard3 = new Board(
    [
      [-0.5, 1, 1, 1, -0.5],
      [1, 1, 1, 1],
      [-0.5, -1, 1, 1, -0.5],
      [-1, 1, 1, 1],
      [-0.5, -1, -1, 0, -0.5],
    ],
    BoardType.triangular
  );
  private board!: Board;
  private holesStatus!: Hole[][];
  private boardStatusSubject = new ReplaySubject<BoardStatus>(1);
  boardStatus$: Observable<BoardStatus>;
  constructor() {
    this.boardStatus$ = this.boardStatusSubject.asObservable();
    this.setBoard(this.englishBoard);
  }

  setBoard(board: Board): void {
    this.board = board;
    this.initBoardStatus();
    this.updateStatus();
  }

  updateStatus(selected?: Position): void {
    let jumpablePegCount = 0;
    for (let row = 0; row < this.holesStatus.length; row++) {
      for (let col = 0; col < this.holesStatus[row].length; col++) {
        const position = { col, row };
        const hole = this.getHole(position);
        const neighborPositions = this.board.getNeighborPositions(position);
        const jumpable = neighborPositions.some((neighbor) => {
          const bypassType = this.getHole(neighbor.bypass).type;
          const targetType = this.getHole(neighbor.target).type;
          if (
            hole.type > HoleType.empty &&
            bypassType > HoleType.empty &&
            targetType === HoleType.empty
          ) {
            return true;
          }
          return false;
        });
        if (jumpable) {
          hole.status = HoleStatus.jumpable;
          jumpablePegCount += 1;
        } else {
          hole.status = HoleStatus.normal;
        }
      }
    }
    if (selected) {
      const hole = this.getHole(selected);
      if (hole.type > HoleType.empty) {
        hole.status =
          hole.status === HoleStatus.jumpable
            ? HoleStatus.selectedJumpable
            : HoleStatus.selectedUnjumpable;
        const neighborPositions = this.board.getNeighborPositions(selected);
        neighborPositions.forEach((neighbor) => {
          const bypass = this.getHole(neighbor.bypass);
          const target = this.getHole(neighbor.target);
          if (bypass.type > HoleType.empty && target.type === HoleType.empty) {
            target.status = HoleStatus.target;
          }
        });
      }
    }
    const boardStatus: BoardStatus = {
      jumpablePegCount,
      holeStatus: this.deepClone<Hole>(this.holesStatus),
      board: this.board,
    };
    this.boardStatusSubject.next(boardStatus);
  }

  move(direction: Direction, selected: Position, reverse: boolean): boolean {
    const neighbor = this.board.getNeighborPosition(selected, direction);
    if (neighbor) {
      const start = this.getHole(selected);
      const bypass = this.getHole(neighbor.bypass);
      const target = this.getHole(neighbor.target);
      if (reverse) {
        if (
          start.type > HoleType.empty &&
          bypass.type >= HoleType.empty &&
          target.type >= HoleType.empty
        ) {
          start.type = start.type - 1;
          bypass.type = bypass.type + 1;
          target.type = target.type + 1;
          this.updateStatus(neighbor.target);
          return true;
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
          this.updateStatus(neighbor.target);
          return true;
        }
      }
    }
    return false;
  }

  deepClone<T>(obj: T[][]): T[][] {
    return obj.map((row) => row.slice());
    // return JSON.parse(JSON.stringify(obj));
  }

  getHole(position: Position): Hole {
    return this.holesStatus[position.row][position.col];
  }

  private initBoardStatus(): void {
    const holesStatus: Hole[][] = this.board.map.map((row) => {
      return row.map((value) => {
        return {
          type: value,
          status: HoleStatus.normal,
        };
      });
    });
    this.holesStatus = holesStatus;
  }
}
