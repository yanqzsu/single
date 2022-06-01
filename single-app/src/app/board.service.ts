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
      [-1, 1, 1, -1],
      [-1, 1, 1, 1, -1],
      [1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ],
    BoardType.triangularOdd
  );

  triangleBoard2 = new Board(
    [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1],
      [-1, 1, 1, 1, -1],
      [-1, 1, 1, -1],
      [-1, -1, 0, -1, -1],
    ],
    BoardType.triangularOdd
  );

  triangleBoard3 = new Board(
    [
      [1, 1, 1],
      [1, 1, 1, 1],
      [-1, 1, 1],
      [-1, 1, 1, 1],
      [-1, -1, 0],
    ],
    BoardType.triangularEven
  );
  board: Board;

  get boardStatus(): Hole[][] {
    return this.boardStatusSubject.value;
  }

  boardStatusSubject = new BehaviorSubject<Hole[][]>([[]]);

  constructor() {
    this.board = this.triangleBoard3;
    this.initBoardStatus();
  }

  updateStatus(selected: Position): void {
    for (let row = 0; row < this.boardStatus.length; row++) {
      for (let col = 0; col < this.boardStatus[row].length; col++) {
        const position = { col, row };
        const hole = this.getHole(position);
        const neighborPositions = this.board.getNeighborPositions(position);
        const jumpable = neighborPositions.some((neighbor) => {
          const bypass = this.getHole(neighbor.bypass).type;
          const spot = this.getHole(neighbor.spot).type;
          if (hole.type > 0 && bypass > 0 && spot === 0) {
            return true;
          }
          return false;
        });
        hole.status = jumpable ? HoleStatus.jumpable : HoleStatus.normal;
        if (position.col === selected.col && position.row === selected.row) {
          hole.status = HoleStatus.selected;
          neighborPositions.forEach((neighbor) => {
            const bypass = this.getHole(neighbor.bypass);
            const spot = this.getHole(neighbor.spot);
            if (bypass.type > 0 && spot.type === 0) {
              spot.status = HoleStatus.spot;
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
      const spot = this.getHole(neighbor.spot);
      if (reverse) {
        if (start.type > 0 && bypass.type > -1 && spot.type > 0) {
          start.type = start.type - 1;
          bypass.type = bypass.type + 1;
          spot.type = spot.type + 1;
          spot.status = HoleStatus.selected;
          this.updateStatus(neighbor.spot);
          return true;
        }
      } else {
        if (start.type > 0 && bypass.type > 0 && spot.type === HoleType.empty) {
          start.type = start.type - 1;
          bypass.type = bypass.type - 1;
          spot.type = spot.type + 1;
          spot.status = HoleStatus.selected;
          this.updateStatus(neighbor.spot);
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
