import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BOARD_LIST } from 'src/app/types/board-list';
import { OutputBoard } from 'src/app/types/output-board';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-classic',
  templateUrl: './classic.component.html',
  styleUrls: ['./classic.component.scss'],
})
export class ClassicComponent implements OnInit {
  templateRef: TemplateRef<any> | null = null;

  @ViewChild('gameOver')
  gameOver!: TemplateRef<any>;

  @ViewChild('ranking')
  ranking!: TemplateRef<any>;

  board!: OutputBoard;

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.scoreStatus$.subscribe((status) => {
      if (status.jumpablePegCount === 0) {
        this.showGameOver();
      }
    });
    // random board for test
    this.board = BOARD_LIST[
      BOARD_LIST.list[Math.floor(Math.random() * BOARD_LIST.list.length)]
    ] as OutputBoard;
    // BOARD_LIST['englishDiagonalBoard2'] as OutputBoard,
    this.appService.setBoard(this.board, false);
  }

  undo(): void {
    this.appService.undo();
  }

  newGame(): void {
    this.appService.setBoard(this.board, false);
  }

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
