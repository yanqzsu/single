import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Operation, Status } from './app.service';
import { BoardService } from './board.service';
import { BoardType, Direction, Hole, Position } from './type';
import { getEventPosition, isTouchEvent, silentEvent } from './util/dom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly Board_Type = BoardType;
  private readonly STEP_BONUS = 10;
  private readonly COMBO_BONUS = 2;
  private readonly MAX_COMBO_BONUS = 10;

  touchStartClientX: number = 0;
  touchStartClientY: number = 0;
  selectedPosition: Position = {
    col: -1,
    row: -1,
  };

  scoreStatus: Status = {
    remainingCount: 0,
    mobileCellCount: 0,
    currentCombo: 0,
    maxCombo: 0,
    comboCount: 0,
    takenCount: 0,
    score: 0,
    steps: 0,
  };

  operationStack: Operation[] = [];

  templateRef: TemplateRef<any> | null = null;

  @ViewChild('gameOver')
  gameOver!: TemplateRef<any>;

  @ViewChild('ranking')
  ranking!: TemplateRef<any>;

  borderStatus: Hole[][] = [];

  boardType: BoardType = BoardType.rectangular;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.boardStatusSubject.subscribe((status) => {
      this.borderStatus = status;
      this.boardType = this.boardService.board.boardType;
    });
  }

  startMove(event: TouchEvent | MouseEvent, row?: number, col?: number) {
    if (row !== undefined && col !== undefined) {
      const position = {
        col,
        row,
      };
      if (!this.boardService.board.isOutrange(position)) {
        this.selectedPosition = position;
      }
    }
    if (this.boardService.board.isOutrange(this.selectedPosition)) {
      return;
    }
    if (
      isTouchEvent(event) &&
      (event.touches.length > 1 || event.targetTouches.length > 1)
    ) {
      return; // Ignore if still touching with one or more fingers
    }
    const position = getEventPosition(event);
    this.touchStartClientX = position.clientX;
    this.touchStartClientY = position.clientY;
    silentEvent(event);
  }

  endMove(event: TouchEvent | MouseEvent, row?: number, col?: number) {
    if (this.selectedPosition.col < 0 && this.selectedPosition.row < 0) {
      return;
    }
    const isTouch = isTouchEvent(event);
    if (
      isTouch &&
      (event.touches.length > 0 || event.targetTouches.length > 0)
    ) {
      return; // Ignore if still touching with one or more fingers
    }
    const touchEndClientX = isTouch
      ? event.changedTouches[0].clientX
      : event.clientX;
    const touchEndClientY = isTouch
      ? event.changedTouches[0].clientY
      : event.clientY;

    const dx = touchEndClientX - this.touchStartClientX;
    const absDx = Math.abs(dx);

    const dy = touchEndClientY - this.touchStartClientY;
    const absDy = Math.abs(dy);
    let direction;
    if (
      this.boardService.board.boardType === BoardType.rectangular &&
      Math.max(absDx, absDy) > 10
    ) {
      direction =
        absDx > absDy
          ? dx > 0
            ? Direction.right
            : Direction.left
          : dy > 0
          ? Direction.down
          : Direction.up;
    } else if (
      this.boardService.board.boardType === BoardType.diagonalRectangular &&
      Math.max(absDx, absDy) > 10
    ) {
      const radio = absDx / absDy;
      if (radio > 2 || radio < 0.5) {
        direction =
          absDx > absDy
            ? dx > 0
              ? Direction.right
              : Direction.left
            : dy > 0
            ? Direction.down
            : Direction.up;
      } else {
        direction =
          dx > 0
            ? dy > 0
              ? Direction.downRight
              : Direction.upRight
            : dy > 0
            ? Direction.downLeft
            : Direction.upLeft;
      }
    } else if (
      (this.boardService.board.boardType === BoardType.triangularEven ||
        this.boardService.board.boardType === BoardType.triangularOdd) &&
      Math.max(absDx, absDy) > 10
    ) {
      const radio = absDx / absDy;
      if (radio > 2) {
        direction = dx > 0 ? Direction.right : Direction.left;
      } else {
        direction =
          dx > 0
            ? dy > 0
              ? Direction.downRight
              : Direction.upRight
            : dy > 0
            ? Direction.downLeft
            : Direction.upLeft;
      }
    }

    if (direction) {
      this.boardService.move(direction, this.selectedPosition, false);
    }
    silentEvent(event);
  }

  undo(): void {}

  showRanking(): void {
    this.templateRef = this.ranking;
  }

  showGameOver(): void {
    this.templateRef = this.gameOver;
  }

  clearOverlay(): void {
    this.templateRef = null;
  }
}
