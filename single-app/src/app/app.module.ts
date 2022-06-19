import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClassicComponent } from './pages/classic/classic.component';
import { HomeComponent } from './pages/home/home.component';
import { CustomComponent } from './pages/custom/custom.component';
import { HeaderComponent } from './components/header/header.component';
import { BoardComponent } from './components/board/board.component';
import { HoleComponent } from './components/hole/hole.component';
import { ModalComponent } from './elements/modal/modal.component';
import { ButtonComponent } from './elements/button/button.component';
import { AboardComponent } from './components/aboard/aboard.component';

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
    AboardComponent,
    HeaderComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
