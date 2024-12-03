import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarclasemodalPage } from './editarclasemodal.page';

const routes: Routes = [
  {
    path: '',
    component: EditarclasemodalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarclasemodalPageRoutingModule {}
