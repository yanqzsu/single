import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BOARD_LIST } from 'src/app/types/board-list';
import { BoardStatusBase } from 'src/app/types/status/board-status.base';
import { deepClone, isOutrange } from 'src/app/util/util';
import { OutputBoard } from '../../types/output-board';
import { Hole, Operation, Position, ScoreStatus } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly TAKEN_BONUS = 4;
  private readonly COMBO_BONUS = 3;
  private readonly MAX_COMBO_BONUS = 1;
  private _board!: OutputBoard;
  boardStatus!: BoardStatusBase;
  private operationStack: Operation[] = [];
  private holeStatusSubject = new ReplaySubject<Hole[][]>(1);
  private scoreStatusSubject = new ReplaySubject<ScoreStatus>(1);
  holeStatus$: Observable<Hole[][]>;
  scoreStatus$: Observable<ScoreStatus>;

  isRevert: boolean = false;

  constructor() {
    this.scoreStatus$ = this.scoreStatusSubject.asObservable();
    this.holeStatus$ = this.holeStatusSubject.asObservable();
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
    this.holeStatusSubject.next(deepClone(this.boardStatus.holes));
  }

  get board(): OutputBoard {
    return this._board;
  }

  setSelectedHole(position: Position): Position | undefined {
    if (this.boardStatus.hasPeg(position)) {
      const result = this.boardStatus.updateStatus(position);
      this.holeStatusSubject.next(deepClone(this.boardStatus.holes));
      return result;
    }
    return position;
  }

  drag(
    reverse: boolean,
    startPosition: Position,
    dx: number,
    dy: number
  ): Position | undefined {
    const direction = this.boardStatus.getDirection(dx, dy);
    if (direction) {
      const endNeighbor = this.boardStatus.getNeighborPosition(
        startPosition,
        direction
      );
      if (endNeighbor) {
        if (this.boardStatus.move(endNeighbor, startPosition, reverse)) {
          this.operationStack.push({
            target: endNeighbor.target,
            source: startPosition,
          });
          this.setSelectedHole(endNeighbor.target);
          this.scoreStatusSubject.next(this.updateScore());
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
      this.boardStatus.hasPeg(startPosition) &&
      !isOutrange(endPosition, this.boardStatus.holes)
    ) {
      const neighborPositions =
        this.boardStatus.getNeighborPositions(startPosition);
      const neighbor = neighborPositions.find((neighbor) =>
        neighbor.target.isSame(endPosition)
      );
      if (neighbor) {
        if (this.boardStatus.move(neighbor, startPosition, reverse)) {
          this.operationStack.push({
            target: neighbor.target,
            source: startPosition,
          });
          this.setSelectedHole(neighbor.target);
          this.scoreStatusSubject.next(this.updateScore());
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

  updateScore(): ScoreStatus {
    const {
      remainingPegCount,
      jumpablePegCount,
      lastPegPosition,
      firstPegPosition,
    } = this.boardStatus;
    const operationStack = [] as Operation[];
    const status: ScoreStatus = {
      remainingPegCount,
      jumpablePegCount,
      currentCombo: 0,
      maxCombo: 0,
      comboCount: 0,
      takenCount: 0,
      score: 0,
      steps: 0,
      distance: 0,
    };

    for (let index = 0; index < operationStack.length; index++) {
      const operation = operationStack[index];
      if (index > 0) {
        const previousOperation = operationStack[index - 1];
        if (previousOperation.target.isSame(operation.source)) {
          status.currentCombo += 1;
          status.comboCount += 1;
          if (status.currentCombo > status.maxCombo) {
            status.maxCombo = status.currentCombo;
          }
        } else {
          status.steps += 1;
          status.currentCombo = 0;
        }
        status.takenCount += 1;
      } else {
        status.takenCount = 1;
        status.steps = 1;
      }
    }
    this.getScore(status, firstPegPosition, lastPegPosition);
    return status;
  }

  getScore(
    status: ScoreStatus,
    firstPegPosition?: Position,
    lastPegPosition?: Position
  ) {
    status.score =
      status.takenCount * this.TAKEN_BONUS +
      status.comboCount * this.COMBO_BONUS +
      status.maxCombo * this.MAX_COMBO_BONUS;
    if (lastPegPosition && firstPegPosition) {
      status.distance = lastPegPosition.getDistance(firstPegPosition);
    }
  }

  /**
   * http://www.gibell.net/pegsolitaire/Catalogs/English33/index.htm
   * @param boardStatus
   */
  private test(): void {
    const board = BOARD_LIST['englishBoard'];
    const scoreStatus1 = {
      maxCombo: 5,
      comboCount: 13,
      takenCount: 31,
      score: 0,
      remainingPegCount: 0,
      jumpablePegCount: 0,
      currentCombo: 0,
      steps: 0,
      distance: 0,
    };
    this.getScore(scoreStatus1, new Position(0, 0), new Position(5, 5));
    console.log(scoreStatus1.score);
    const scoreStatus2 = {
      maxCombo: 5,
      comboCount: 13,
      takenCount: 31,
      score: 0,
      remainingPegCount: 0,
      jumpablePegCount: 0,
      currentCombo: 0,
      steps: 0,
      distance: 0,
    };
    this.getScore(scoreStatus2, new Position(3, 3), new Position(5, 5));
    console.log(scoreStatus2.score);
    const scoreStatus3 = {
      maxCombo: 6,
      comboCount: 14,
      takenCount: 31,
      score: 0,
      remainingPegCount: 0,
      jumpablePegCount: 0,
      currentCombo: 0,
      steps: 0,
      distance: 0,
    };
    this.getScore(scoreStatus3, new Position(0, 6), new Position(5, 5));
  }
}
