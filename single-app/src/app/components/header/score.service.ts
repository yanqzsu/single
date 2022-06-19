import { ThisReceiver } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { BoardService } from '../board/board.service';
import { Board, BoardStatus } from '../../board.type';
import { HoleType, Position } from '../../type';
import { BOARD_LIST } from 'src/app/board-list';

export interface ScoreStatus {
  remainingPegCount: number;
  jumpablePegCount: number;
  currentCombo: number;
  maxCombo: number;
  comboCount: number;
  takenCount: number;
  score: number;
  steps: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  private readonly TAKEN_BONUS = 4;
  private readonly COMBO_BONUS = 3;
  private readonly MAX_COMBO_BONUS = 1;
  private readonly DISTANCE_FIBONACCI = [0, 1, 2, 4, 6, 9, 12, 16, 20];

  scoreStatus$: Observable<ScoreStatus>;

  constructor(private boardService: BoardService) {
    this.scoreStatus$ = this.boardService.boardStatus$.pipe(
      switchMap((boardStatus) => {
        return of<ScoreStatus>(this.updateScore(boardStatus));
      })
    );
    this.test();
  }

  updateScore(boardStatus: BoardStatus): ScoreStatus {
    const {
      remainingPegCount,
      jumpablePegCount,
      operationStack,
      lastPegPosition,
      board,
    } = boardStatus;
    const status: ScoreStatus = {
      remainingPegCount,
      jumpablePegCount,
      currentCombo: 0,
      maxCombo: 0,
      comboCount: 0,
      takenCount: 0,
      score: 0,
      steps: 0,
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
    this.getScore(status, lastPegPosition, board);
    return status;
  }

  private getScore(
    status: ScoreStatus,
    lastPegPosition: Position | undefined,
    board: Board
  ) {
    status.score =
      status.takenCount * this.TAKEN_BONUS +
      status.comboCount * this.COMBO_BONUS +
      status.maxCombo * this.MAX_COMBO_BONUS;

    if (lastPegPosition) {
      const distance = lastPegPosition.getDistance(board.startPosition);
      const maxDistance = lastPegPosition.getDistance(
        new Position(board.map[0].length - 1, board.map.length - 1)
      );
      const index = maxDistance - distance;
      status.score += this.DISTANCE_FIBONACCI[index];
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
    };
    this.getScore(scoreStatus1, new Position(0, 0), board as Board);
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
    };
    this.getScore(scoreStatus2, new Position(3, 3), board as Board);
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
    };
    this.getScore(scoreStatus3, new Position(0, 6), board as Board);
  }
}
