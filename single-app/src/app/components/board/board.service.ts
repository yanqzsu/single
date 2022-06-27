import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BOARD_LIST } from 'src/app/board-list';
import { BoardStatus } from 'src/app/status.type';
import { deepClone } from 'src/app/util/util';
import { Board } from '../../board.type';
import {
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
export class BoardService {
  private _board!: Board;
  private holesStatus!: Hole[][];
  private operationStack: Operation[] = [];
  private selectedPosition: Position = new Position();
  private boardStatusSubject = new ReplaySubject<BoardStatus>(1);
  boardStatus$: Observable<BoardStatus>;

  constructor() {
    this.boardStatus$ = this.boardStatusSubject.asObservable();
    // random board for test
    // this.board = BOARD_LIST[
    //   BOARD_LIST.list[Math.floor(Math.random() * BOARD_LIST.list.length)]
    // ] as Board;

    // board for test
    this.board = BOARD_LIST['triangleBoard11'] as Board;
    console.log(this.board.serilize());
  }

  set board(board: Board) {
    this._board = board;
  }

  get board(): Board {
    return this._board;
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
  }

  setSelectedPosition(position: Position, refreshStatus?: boolean): void {
    if (this.hasPeg(position)) {
      this.selectedPosition = position;
    }
    if (refreshStatus) {
      this.updateStatus(this.selectedPosition);
    }
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
}
