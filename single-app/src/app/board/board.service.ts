import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Board, BoardStatus, BOARD_LIST } from './board.type';
import {
  Direction,
  Hole,
  HoleStatus,
  HoleType,
  Neighbor,
  Position,
} from '../type';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private _board!: Board;
  private holesStatus!: Hole[][];
  private boardStatusSubject = new ReplaySubject<BoardStatus>(1);
  boardStatus$: Observable<BoardStatus>;

  constructor() {
    this.boardStatus$ = this.boardStatusSubject.asObservable();
    // random board for test
    this.board = BOARD_LIST[
      BOARD_LIST.list[Math.floor(Math.random() * BOARD_LIST.list.length)]
    ] as Board;
  }

  set board(board: Board) {
    this._board = board;
    this.initBoardStatus();
    this.updateStatus();
  }

  get board(): Board {
    return this._board;
  }

  updateStatus(selected?: Position): void {
    let jumpablePegCount = 0;
    for (let row = 0; row < this.holesStatus.length; row++) {
      for (let col = 0; col < this.holesStatus[row].length; col++) {
        const position = new Position(col, row);
        const hole = this.getHole(position);
        const neighborPositions = this.board.getNeighborPositions(position);
        const jumpable = neighborPositions.some(
          (neighbor: { bypass: Position; target: Position }) => {
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
    if (selected) {
      const hole = this.getHole(selected);
      if (hole.type > HoleType.empty) {
        hole.status =
          hole.status === HoleStatus.jumpable
            ? HoleStatus.selectedJumpable
            : HoleStatus.selectedUnjumpable;
        const neighborPositions = this.board.getNeighborPositions(selected);
        neighborPositions.forEach(
          (neighbor: { bypass: Position; target: Position }) => {
            const bypass = this.getHole(neighbor.bypass);
            const target = this.getHole(neighbor.target);
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
      jumpablePegCount,
      holeStatus: this.deepClone<Hole>(this.holesStatus),
      board: this.board,
    };
    this.boardStatusSubject.next(boardStatus);
  }

  drag(direction: Direction, selected: Position, reverse: boolean): Position {
    const neighbor = this.board.getNeighborPosition(selected, direction);
    if (neighbor) {
      return this.move(neighbor, selected, reverse);
    }
    return selected;
  }

  click(
    position: Position,
    selectedPosition: Position,
    reverse: boolean
  ): Position {
    const neighborPositions = this.board.getNeighborPositions(selectedPosition);
    const neighbor = neighborPositions.find((neighbor) =>
      neighbor.target.isSame(position)
    );
    if (neighbor) {
      return this.move(neighbor, selectedPosition, reverse);
    }
    return selectedPosition;
  }

  private move(
    neighbor: Neighbor,
    selected: Position,
    reverse: boolean
  ): Position {
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
        return neighbor.target;
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
        return neighbor.target;
      }
    }
    return selected;
  }

  public hasPeg(position: Position): boolean {
    const hole = this.getHole(position);
    return hole.type > HoleType.empty;
  }

  public getHole(position: Position): Hole {
    return this.holesStatus[position.row][position.col];
  }

  private deepClone<T>(obj: T[][]): T[][] {
    return obj.map((row) => row.slice());
    // return JSON.parse(JSON.stringify(obj));
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
  }
}
