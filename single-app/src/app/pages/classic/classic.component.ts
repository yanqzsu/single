import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BoardService } from '../../components/board/board.service';

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

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.boardService.scoreStatus$.subscribe((status) => {
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
