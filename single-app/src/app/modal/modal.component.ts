import {
  Component,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-modal',
  styleUrls: ['./modal.component.scss'],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  private _templateRef: TemplateRef<any> | null = null;
  private _document: Document;

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  @Input()
  set templateRef(templateRef: TemplateRef<any> | null) {
    this._templateRef = templateRef;
    const root = this._document.documentElement!;
    if (templateRef) {
      root.classList.add('global-scrollblock');
    } else {
      root.classList.remove('global-scrollblock');
    }
  }

  get templateRef(): TemplateRef<any> | null {
    return this._templateRef;
  }

  @Output()
  backdropEvent = new EventEmitter();

  @Input()
  backdrop = false;

  onBackdropClick(): void {
    this.backdropEvent.emit();
  }
}
