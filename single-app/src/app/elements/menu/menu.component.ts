import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'button[app-menu], a[app-menu]',
  exportAs: 'app-menu',
  styleUrls: ['./menu.component.scss'],
  template: `<ng-content></ng-content>`,
})
export class MenuComponent {
  constructor(public element: ElementRef<HTMLElement>){}
}
