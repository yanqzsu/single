import { Component, HostBinding, Input } from '@angular/core';
import { HoleType } from '../type';

@Component({
  selector: 'app-peg',
  styleUrls: ['./peg.component.scss'],
  template: `<div class="peg" [ngClass]="typeClass"></div>`,
})
export class PegComponent {
  typeClass: any;

  @Input()
  @HostBinding('class.jumpable')
  jumpable: boolean = false;

  @Input()
  @HostBinding('class.selected')
  selected: boolean = false;

  @Input()
  set type(type: HoleType) {
    this.typeClass = {
      'hole-type-0': type === HoleType.empty,
      'hole-type-1': type === HoleType.one,
      'hole-type-2': type === HoleType.two,
      'hole-type-3': type === HoleType.three,
      'hole-type-4': type === HoleType.four,
      'hole-type-5': type === HoleType.five,
      'hole-type-6': type === HoleType.six,
      'hole-type-7': type === HoleType.seven,
      'hole-type-8': type === HoleType.eight,
      'hole-type-9': type === HoleType.nine,
    };
  }
}
