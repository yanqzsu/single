import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BoardService } from '../../components/board/board.service';

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
