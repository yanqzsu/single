import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MenuComponent } from 'src/app/elements/menu/menu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(private render2: Renderer2) {}

  year = new Date().getFullYear();

  @ViewChildren(MenuComponent)
  menuItems!: QueryList<MenuComponent>;

  @ViewChild('logo', { read: ElementRef })
  logo!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    setTimeout(() => {
      this.menuItems.forEach((item) => {
        this.render2.addClass(item.element.nativeElement, 'fade-in');
      });
      this.render2.addClass(this.logo.nativeElement, 'fade-in');
    }, 100);
  }
}
