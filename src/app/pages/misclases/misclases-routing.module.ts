import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisclasesPage } from './misclases.page';

const routes: Routes = [
  {
    path: '',
    component: MisclasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisclasesPageRoutingModule {}
