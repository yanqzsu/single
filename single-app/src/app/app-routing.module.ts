import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicComponent } from './pages/classic/classic.component';
import { CustomComponent } from './pages/custom/custom.component';
import { HomeComponent } from './pages/home/home.component';

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
