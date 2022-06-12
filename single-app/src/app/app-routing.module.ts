import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicComponent } from './classic/classic.component';
import { CustomComponent } from './custom/custom.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    component: ClassicComponent,
    path: 'classic',
  },
  {
    component: CustomComponent,
    path: 'custom',
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
