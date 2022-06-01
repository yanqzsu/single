import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Board,
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
      [-0.5, -1, 1, 1, -1,-0.5],
      [-1, 1, 1, 1, -1],
      [-0.5, 1, 1, 1, 1,-0.5],
      [1, 1, 1, 1, 1],
    ],
    BoardType.triangular
  );

  triangleBoard2 = new Board(
    [
      [1, 1, 1, 1, 1],
      [-0.5, 1, 1, 1, 1,-0.5],
      [-1, 1, 1, 1, -1],
      [-0.5, -1, 1, 1, -1,-0.5],
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
  board: Board;

  get boardStatus(): Hole[][] {
    return this.boardStatusSubject.value;
  }

  boardStatusSubject = new BehaviorSubject<Hole[][]>([[]]);

  constructor() {
    this.board = this.triangleBoard2;
    this.initBoardStatus();
    this.updateStatus();
  }

  updateStatus(selected?: Position): void {
    for (let row = 0; row < this.boardStatus.length; row++) {
      for (let col = 0; col < this.boardStatus[row].length; col++) {
        const position = { col, row };
        const hole = this.getHole(position);
        const neighborPositions = this.board.getNeighborPositions(position);
        const jumpable = neighborPositions.some((neighbor) => {
          const bypass = this.getHole(neighbor.bypass).type;
          const target = this.getHole(neighbor.target).type;
          if (hole.type > 0 && bypass > 0 && target === 0) {
            return true;
          }
          return false;
        });
        hole.status = jumpable ? HoleStatus.jumpable : HoleStatus.normal;
        if (position.col === selected?.col && position.row === selected?.row) {
          hole.status = HoleStatus.selected;
          neighborPositions.forEach((neighbor) => {
            const bypass = this.getHole(neighbor.bypass);
            const target = this.getHole(neighbor.target);
            if (bypass.type > 0 && target.type === 0) {
              target.status = HoleStatus.target;
            }
          });
        }
      }
    }
    this.boardStatusSubject.next(this.deepClone(this.boardStatus));
  }

  move(direction: Direction, selected: Position, reverse: boolean): boolean {
    const neighbor = this.board.getNeighborPosition(selected, direction);
    if (neighbor) {
      const start = this.getHole(selected);
      const bypass = this.getHole(neighbor.bypass);
      const target = this.getHole(neighbor.target);
      if (reverse) {
        if (start.type > 0 && bypass.type > -1 && target.type > 0) {
          start.type = start.type - 1;
          bypass.type = bypass.type + 1;
          target.type = target.type + 1;
          target.status = HoleStatus.selected;
          this.updateStatus(neighbor.target);
          return true;
        }
      } else {
        if (start.type > 0 && bypass.type > 0 && target.type === HoleType.empty) {
          start.type = start.type - 1;
          bypass.type = bypass.type - 1;
          target.type = target.type + 1;
          target.status = HoleStatus.selected;
          this.updateStatus(neighbor.target);
          return true;
        }
      }
    }
    return false;
  }

  deepClone(obj: any): any {
    // this.pieceArray = this.pieceArray.map((arr) => arr.slice());
    return JSON.parse(JSON.stringify(obj));
  }

  getHole(position: Position): Hole {
    return this.boardStatus[position.row][position.col];
  }

  private initBoardStatus(): void {
    const boardStatus: Hole[][] = this.board.map.map((row) => {
      return row.map((value) => {
        return {
          type: value,
          status: HoleStatus.normal,
        };
      });
    });
    this.boardStatusSubject.next(boardStatus);
  }
}
