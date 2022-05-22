import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlogoHomeComponent } from './home.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: FlogoHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
