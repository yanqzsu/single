import { Component, OnInit } from '@angular/core';
import { Direction, Position } from '../../type';
import { isTouchEvent, getEventPosition, silentEvent } from '../../util/dom';
import { BoardStatus } from '../../board.type';
import { AboardService } from './aboard.service';

@Component({
  selector: 'app-aboard',
  templateUrl: './aboard.component.html',
  styleUrls: ['./aboard.component.scss'],
})
export class AboardComponent implements OnInit {
  touchStartClientX: number = 0;
  touchStartClientY: number = 0;
  boardStatus!: BoardStatus;

  constructor(private boardService: AboardService) {}

  ngOnInit(): void {
    this.boardService.boardStatus$.subscribe((status) => {
      this.boardStatus = status;
    });
  }

  startMove(event: TouchEvent | MouseEvent, row?: number, col?: number) {
    if (
      isTouchEvent(event) &&
      (event.touches.length > 1 || event.targetTouches.length > 1)
    ) {
      return; // Ignore if still touching with one or more fingers
    }
    this.boardService.setSelectedPosition(new Position(col, row), false);
    const touchPosition = getEventPosition(event);
    this.touchStartClientX = touchPosition.clientX;
    this.touchStartClientY = touchPosition.clientY;
    silentEvent(event);
  }

  endMove(event: TouchEvent | MouseEvent, row?: number, col?: number): void {
    const direction = this.getDirection(event);
    if (direction) {
      // by drag and drop
      this.boardService.drag(false, direction);
    } else if (row !== undefined && col !== undefined) {
      // by click
      const position = new Position(col, row);
      this.boardService.click(false, position);
    }
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
    direction = this.boardService.getDirection(dx, dy);
    return direction;
  }
}
