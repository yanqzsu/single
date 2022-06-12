import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { ButtonComponent } from './button/button.component';
import { ClassicComponent } from './classic/classic.component';
import { CustomComponent } from './custom/custom.component';
import { HeaderComponent } from './header/header.component';
import { HoleComponent } from './hole/hole.component';
import { HomeComponent } from './home/home.component';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ClassicComponent,
    CustomComponent,
    ButtonComponent,
    HoleComponent,
    ModalComponent,
    BoardComponent,
    HeaderComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
