import { Component, Input } from '@angular/core';
import { HoleType, HoleStatus, Hole } from '../type';

@Component({
  selector: 'app-hole',
  templateUrl: './hole.component.html',
  styleUrls: ['./hole.component.scss'],
})
export class HoleComponent {
  _hole: Hole = {
    type: HoleType.empty,
    status: HoleStatus.normal,
  };

  jumpable: boolean = false;
  selected: boolean = false;

  statusClass = {
    'hole-spot':
      this._hole.type === HoleType.empty &&
      this._hole.status === HoleStatus.spot,
    'hole-normal': this._hole.status === HoleStatus.normal,
  };

  pegClass = {};

  @Input()
  set hole(hole: Hole) {
    this._hole = hole;
    this.selected =
      this._hole.type > 0 && this._hole.status === HoleStatus.selected;
    this.jumpable =
      this._hole.type > 0 && this._hole.status === HoleStatus.jumpable;
  }
  get hole(): Hole {
    return this._hole;
  }
}
