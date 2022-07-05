import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BOARD_LIST } from 'src/app/types/board-list';
import { BoardStatusBase } from 'src/app/types/board-status.base';
import { deepClone, isOutrange } from 'src/app/util/util';
import { OutputBoard } from '../../types/output-board.type';
import { Direction, Operation, Position, SelectedHole } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private _board!: OutputBoard;
  private _boardStatus!: BoardStatusBase;
  private operationStack: Operation[] = [];
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

  setSelectedHole(position: Position): Position | undefined {
    if (this._boardStatus.hasPeg(position)) {
      return this._boardStatus.updateStatus(position);
    }
    return position;
  }

  drag(
    reverse: boolean,
    startPosition: Position,
    dx: number,
    dy: number
  ): Position | undefined {
    const direction = this._boardStatus.getDirection(dx, dy);
    if (direction) {
      const endNeighbor = this._boardStatus.getNeighborPosition(
        startPosition,
        direction
      );
      if (endNeighbor) {
        if (this._boardStatus.move(endNeighbor, startPosition, reverse)) {
          this.operationStack.push({
            target: endNeighbor.target,
            source: startPosition,
          });
          this.setSelectedHole(endNeighbor.target);
          return endNeighbor.target;
        }
      }
    }
    return undefined;
  }

  click(
    reverse: boolean,
    endPosition: Position,
    startPosition: Position
  ): Position | undefined {
    if (
      this._boardStatus.hasPeg(startPosition) &&
      !isOutrange(endPosition, this._boardStatus.holes)
    ) {
      const neighborPositions =
        this._boardStatus.getNeighborPositions(startPosition);
      const neighbor = neighborPositions.find((neighbor) =>
        neighbor.target.isSame(endPosition)
      );
      if (neighbor) {
        if (this._boardStatus.move(neighbor, startPosition, reverse)) {
          this.operationStack.push({
            target: neighbor.target,
            source: startPosition,
          });
          this.setSelectedHole(neighbor.target);
          return neighbor.target;
        }
      }
    }
    return startPosition;
  }

  undo(): void {
    const operation = this.operationStack.pop();
    if (operation) {
      this.click(true, operation.source, operation.target);
    }
  }
}
