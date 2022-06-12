import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BoardService } from '../board/board.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {}
}
