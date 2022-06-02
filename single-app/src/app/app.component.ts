import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Operation, Status } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly STEP_BONUS = 10;
  private readonly COMBO_BONUS = 2;
  private readonly MAX_COMBO_BONUS = 10;

  scoreStatus: Status = {
    remainingCount: 0,
    mobileCellCount: 0,
    currentCombo: 0,
    maxCombo: 0,
    comboCount: 0,
    takenCount: 0,
    score: 0,
    steps: 0,
  };

  operationStack: Operation[] = [];

  templateRef: TemplateRef<any> | null = null;

  @ViewChild('gameOver')
  gameOver!: TemplateRef<any>;

  @ViewChild('ranking')
  ranking!: TemplateRef<any>;

  constructor() {}

  ngOnInit(): void {}

  undo(): void {}

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
