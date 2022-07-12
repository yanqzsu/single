import { Component } from '@angular/core';
import { BOARD_LIST } from 'src/app/types/board-list';
import { OutputBoard } from 'src/app/types/output-board';
import { Hole, Position } from '../../types/type';
import { isTouchEvent, getEventPosition, silentEvent } from '../../util/dom';
import { AppService } from '../../app.service';

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
  holes!: Hole[][];
  boardlass: string = '';

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    // random board for test
    // this.board = BOARD_LIST[
    //   BOARD_LIST.list[Math.floor(Math.random() * BOARD_LIST.list.length)]
    // ] as Board;
    this.appService.setBoard(
      BOARD_LIST['englishDiagonalBoard2'] as OutputBoard,
      true
    );
    this.appService.holeStatus$.subscribe((holes) => {
      this.holes = holes;
      const maxWidth = Math.max(this.holes?.[0].length, this.holes?.[1].length);
      if (maxWidth > 9) {
        this.boardlass = 'size-11';
      } else if (maxWidth > 7) {
        this.boardlass = 'size-9';
      } else if (maxWidth > 5) {
        this.boardlass = 'size-7';
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
    if (this.appService.boardStatus.hasPeg(position)) {
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
      const position = new Position(col, row);
      if (position.isSame(this.startPosition)) {
        // just refresh
        this.appService.setSelectedHole(this.startPosition);
      } else {
        // click
        this.startPosition = this.appService.click(
          position,
          this.startPosition
        );
      }
    } else {
      // touch and drag
      this.startPosition = this.appService.drag(this.startPosition, dx, dy);
    }
    silentEvent(event);
  }
}
