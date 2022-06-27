import { Component, HostBinding, Input } from '@angular/core';
import { HoleType, HoleStatus, Hole } from '../../type';

@Component({
  selector: 'app-hole',
  templateUrl: './hole.component.html',
  styleUrls: ['./hole.component.scss'],
})
export class HoleComponent {
  _hole: Hole = {
    type: HoleType.e,
    status: HoleStatus.normal,
  };

  holeClass: any;
  spotClass: any;
  pegClass: any;

  @HostBinding('class.half')
  isHalf: boolean = true;

  @Input()
  set hole(hole: Hole) {
    this._hole = hole;
    this.isHalf = hole.type === HoleType.h;
    this.spotClass = {
      'spot-target': hole.status === HoleStatus.target,
    };
    this.pegClass = {
      'peg-0': hole.type === HoleType.e,
      'peg-1': hole.type === HoleType.one,
      'peg-2': hole.type === HoleType.two,
      'peg-3': hole.type === HoleType.three,
      'peg-4': hole.type === HoleType.four,
      'peg-5': hole.type === HoleType.five,
      'peg-6': hole.type === HoleType.six,
      'peg-7': hole.type === HoleType.seven,
      'peg-8': hole.type === HoleType.eight,
      'peg-9': hole.type === HoleType.nine,
      'peg-selected':
        (hole.status === HoleStatus.selectedJumpable ||
          hole.status === HoleStatus.selectedUnjumpable) &&
        hole.type > HoleType.e,
      'peg-jumpable':
        (hole.status === HoleStatus.jumpable ||
          hole.status === HoleStatus.selectedJumpable) &&
        hole.type > HoleType.e,
    };
  }
  get hole(): Hole {
    return this._hole;
  }
}
