import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BoardService } from './board/board.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  templateRef: TemplateRef<any> | null = null;

  @ViewChild('gameOver')
  gameOver!: TemplateRef<any>;

  @ViewChild('ranking')
  ranking!: TemplateRef<any>;

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.boardStatus$.subscribe((status) => {
      if (status.jumpablePegCount === 0) {
        this.showGameOver();
      }
    });
  }

  undo(): void {
    this.boardService.undo();
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
