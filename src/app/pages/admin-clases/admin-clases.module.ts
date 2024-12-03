import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminClasesPageRoutingModule } from './admin-clases-routing.module';

import { AdminClasesPage } from './admin-clases.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminClasesPageRoutingModule
  ],
  declarations: [AdminClasesPage]
})
export class AdminClasesPageModule {}
