import { ChangeDetectorRef, Component } from '@angular/core';
import { BoardStatus } from './board.type';
import { BoardType, Direction, Position } from '../type';
import { isTouchEvent, getEventPosition, silentEvent } from '../util/dom';
import { BoardService } from './board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  touchStartClientX: number = 0;
  touchStartClientY: number = 0;
  selectedPosition: Position = new Position();

  boardStatus!: BoardStatus;
  boardType: BoardType = BoardType.rectangular;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.boardStatus$.subscribe((status) => {
      this.boardStatus = status;
      this.boardType = status.board.boardType;
    });
  }

  startMove(event: TouchEvent | MouseEvent, row?: number, col?: number) {
    if (
      isTouchEvent(event) &&
      (event.touches.length > 1 || event.targetTouches.length > 1)
    ) {
      return; // Ignore if still touching with one or more fingers
    }
    const position = new Position(col, row);
    if (this.boardService.hasPeg(position)) {
      this.selectedPosition = position;
      // this.boardService.updateStatus(position);
    }
    const touchPosition = getEventPosition(event);
    this.touchStartClientX = touchPosition.clientX;
    this.touchStartClientY = touchPosition.clientY;
    silentEvent(event);
  }

  endMove(event: TouchEvent | MouseEvent, row?: number, col?: number): void {
    const direction = this.getDirection(event);
    let newSelectedPosition = this.selectedPosition;
    if (direction) {
      // by drag and drop
      newSelectedPosition = this.boardService.drag(
        direction,
        this.selectedPosition,
        false
      );
    } else if (row !== undefined && col !== undefined) {
      // by click
      const position = new Position(col, row);
      if (
        this.boardService.hasPeg(this.selectedPosition) &&
        !this.boardService.board.isOutrange(position) &&
        !this.selectedPosition.isSame(position)
      ) {
        newSelectedPosition = this.boardService.click(
          position,
          this.selectedPosition,
          false
        );
      }
    }
    if (!newSelectedPosition.isSame(this.selectedPosition)) {
      this.selectedPosition = newSelectedPosition;
    }
    this.boardService.updateStatus(newSelectedPosition);

    silentEvent(event);
  }

  private getDirection(event: TouchEvent | MouseEvent): Direction | undefined {
    let direction;
    const isTouch = isTouchEvent(event);
    if (
      isTouch &&
      (event.touches.length > 0 || event.targetTouches.length > 0)
    ) {
      return direction; // Ignore if still touching with one or more fingers
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
    if (
      this.boardType === BoardType.rectangular &&
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
      this.boardType === BoardType.diagonalRectangular &&
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
      this.boardType === BoardType.triangular &&
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
    return direction;
  }
}
