import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

  constructor(private boardService: AppService) {}

  ngOnInit(): void {
    this.boardService.scoreStatus$.subscribe((status: ScoreStatus) => {
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
