import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BOARD_LIST } from 'src/app/types/board-list';
import { OutputBoard } from 'src/app/types/output-board';
import { ScoreStatus } from 'src/app/types/type';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-custom',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class CustomComponent implements OnInit {
  templateRef: TemplateRef<any> | null = null;

  @ViewChild('gameOver')
  gameOver!: TemplateRef<any>;

  @ViewChild('ranking')
  ranking!: TemplateRef<any>;

  board!: OutputBoard;

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.scoreStatus$.subscribe((status: ScoreStatus) => {
      if (status.jumpablePegCount === 0) {
        this.showGameOver();
      }
    });
    // random board for test
    const key = Math.floor(Math.random() * BOARD_LIST.list.length);
    console.log(key);
    this.board = BOARD_LIST[BOARD_LIST.list[key]] as OutputBoard;
    // BOARD_LIST['englishDiagonalBoard2'] as OutputBoard,
    this.appService.setBoard(this.board, true);
  }

  undo(): void {
    this.appService.undo();
  }

  newGame(): void {
    this.appService.setBoard(this.board, true);
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
