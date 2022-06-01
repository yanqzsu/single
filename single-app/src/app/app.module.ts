import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonComponent } from './button/button.component';
import { HoleComponent } from './hole/hole.component';
import { ModalComponent } from './modal/modal.component';
import { PegComponent } from './peg/piece.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    HoleComponent,
    PegComponent,
    ModalComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
