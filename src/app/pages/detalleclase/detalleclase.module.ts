import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleclasePageRoutingModule } from './detalleclase-routing.module';

import { DetalleclasePage } from './detalleclase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleclasePageRoutingModule
  ],
  declarations: [DetalleclasePage]
})
export class DetalleclasePageModule {}
