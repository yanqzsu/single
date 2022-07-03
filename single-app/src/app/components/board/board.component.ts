import { Component } from '@angular/core';
import { BoardStatusBase } from 'src/app/types/board-status.base';
import { isOutrange } from 'src/app/util/util';
import { Direction, Position } from '../../types/type';
import { isTouchEvent, getEventPosition, silentEvent } from '../../util/dom';
import { BoardService } from './board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  touchStartClientX: number = 0;
  touchStartClientY: number = 0;
  startPosition?: Position;
  endPosition?: Position;
  boardStatus!: BoardStatusBase;

  holeClass: string = '';

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.boardStatus$.subscribe((status) => {
      this.boardStatus = status;
      if (status.maxWidth > 9) {
        this.holeClass = 'size-11';
      } else if (status.maxWidth > 7) {
        this.holeClass = 'size-9';
      } else if (status.maxWidth > 5) {
        this.holeClass = 'size-7';
      }
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
    if (!isOutrange(position, this.boardStatus.holes)) {
      this.startPosition = position;
    }
    const touchPosition = getEventPosition(event);
    this.touchStartClientX = touchPosition.clientX;
    this.touchStartClientY = touchPosition.clientY;
    silentEvent(event);
  }

  endMove(event: TouchEvent | MouseEvent, row?: number, col?: number): void {
    const isTouch = isTouchEvent(event);
    if (isTouch) {
      if (event.touches.length > 0 || event.targetTouches.length > 0) {
        return; // Ignore if still touching with one or more fingers
      }
    }
    if (!this.startPosition) {
      return;
    }
    const touchEndClientX = isTouch
      ? event.changedTouches[0].clientX
      : event.clientX;
    const touchEndClientY = isTouch
      ? event.changedTouches[0].clientY
      : event.clientY;
    const dx = touchEndClientX - this.touchStartClientX;
    const dy = touchEndClientY - this.touchStartClientY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) <= 10) {
      if (row !== undefined && col !== undefined) {
        // click
        const position = new Position(col, row);
        this.startPosition = this.boardService.click(
          false,
          position,
          this.startPosition
        );
      } else {
        // just refresh
        this.boardService.setSelectedPosition(this.startPosition, false);
      }
      return;
    }
    // touch and drag
    this.startPosition = this.boardService.drag(
      false,
      this.startPosition,
      dx,
      dy
    );
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
    const dy = touchEndClientY - this.touchStartClientY;
    direction = this.getDirection(dx, dy);
    return direction;
  }
}
