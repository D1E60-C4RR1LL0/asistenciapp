import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminClasesPage } from './admin-clases.page';

const routes: Routes = [
  {
    path: '',
    component: AdminClasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminClasesPageRoutingModule {}
