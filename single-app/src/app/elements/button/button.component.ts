import { Component } from '@angular/core';

@Component({
  selector: 'button[app-button], a[app-button]',
  exportAs: 'app-button',
  styleUrls: ['./button.component.scss'],
  template: `<ng-content></ng-content>`,
})
export class ButtonComponent {}
