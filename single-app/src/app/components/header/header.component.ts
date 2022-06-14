import { Component, OnInit } from '@angular/core';
import { ScoreService, ScoreStatus } from './score.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(private scoreService: ScoreService) {}

  scoreStatus: ScoreStatus = {
    remainingPegCount: 0,
    jumpablePegCount: 0,
    currentCombo: 0,
    maxCombo: 0,
    comboCount: 0,
    takenCount: 0,
    score: 0,
    steps: 0,
  };

  ngOnInit(): void {
    this.scoreService.scoreStatus$.subscribe((status) => {
      this.scoreStatus = status;
    });
  }
}
