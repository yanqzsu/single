import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BOARD_LIST } from 'src/app/types/board-list';
import { BoardStatusBase } from 'src/app/types/board-status.base';
import { deepClone } from 'src/app/util/util';
import { OutputBoard } from '../../types/output-board.type';
import {
  Direction,
  Operation,
  Position,
  SelectedHole,
} from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private _board!: OutputBoard;
  private _boardStatus!: BoardStatusBase;
  private operationStack: Operation[] = [];
  private selectedPosition?: SelectedHole;
  private boardStatusSubject = new ReplaySubject<BoardStatusBase>(1);
  boardStatus$: Observable<BoardStatusBase>;
  isRevert: boolean = false;

  constructor() {
    this.boardStatus$ = this.boardStatusSubject.asObservable();
    // random board for test
    // this.board = BOARD_LIST[
    //   BOARD_LIST.list[Math.floor(Math.random() * BOARD_LIST.list.length)]
    // ] as Board;

    // board for test
    this.board = BOARD_LIST['triangleBoard11'] as OutputBoard;
    console.log(this.board.serilize());
  }

  set board(board: OutputBoard) {
    this._board = board;
    this.boardStatus = board.toBoardStatus(this.isRevert);
  }

  get board(): OutputBoard {
    return this._board;
  }

  set boardStatus(boardStatus: BoardStatusBase) {
    this._boardStatus = boardStatus;
    this.boardStatusSubject.next(boardStatus);
  }

  get boardStatus(): BoardStatusBase {
    return this._boardStatus;
  }

  setSelectedPosition(position: Position, refreshStatus?: boolean): void {
    if (this._boardStatus.hasPeg(position)) {
      this.selectedPosition = position;
    }
    if (refreshStatus) {
      this._boardStatus.updateStatus(this.selectedPosition);
    }
  }

  drag(reverse: boolean, startPosition: Position, dx: number, dy: number): boolean {
    const direction = this._boardStatus.getDirection(dx, dy);
    if (direction) {
      const endPosition = this._boardStatus.getNeighborPosition(
        startPosition,
        direction
      );
      if (endPosition) {      
        return this._boardStatus.move(
          endPosition,
          startPosition,
          reverse
        );
      }
    }
    return false;
  }

  click(
    reverse: boolean,
    endPosition: Position,
    startPosition?: Position
  ): boolean {
    const position = startPosition || this.selectedPosition;
    let result = false;
    if (position.isSame(endPosition)) {
      this._boardStatus.updateStatus(endPosition);
      return result;
    }
    if (
      this._boardStatus.hasPeg(position) &&
      !this._boardStatus.isOutrange(endPosition)
    ) {
      const neighborPositions =
        this._boardStatus.getNeighborPositions(position);
      const neighbor = neighborPositions.find((neighbor) =>
        neighbor.target.isSame(endPosition)
      );
      if (neighbor) {
        result = this._boardStatus.move(neighbor, position, reverse);
        if (result) {
          this.setSelectedPosition(neighbor.target, true);
          if (this.isRevert)
        }
      }
    }

    return result;
  }

  undo(): void {
    const operation = this.operationStack.pop();
    if (operation) {
      this.click(true, operation.source, operation.target);
    }
  }
}
