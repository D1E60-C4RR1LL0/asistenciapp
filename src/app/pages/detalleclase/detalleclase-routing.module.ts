import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleclasePage } from './detalleclase.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleclasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleclasePageRoutingModule {}
