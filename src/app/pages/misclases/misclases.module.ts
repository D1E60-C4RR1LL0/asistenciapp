import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisclasesPageRoutingModule } from './misclases-routing.module';

import { MisclasesPage } from './misclases.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisclasesPageRoutingModule
  ],
  declarations: [MisclasesPage]
})
export class MisclasesPageModule {}
