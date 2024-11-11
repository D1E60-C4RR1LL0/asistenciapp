import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleramoPageRoutingModule } from './detalleramo-routing.module';

import { DetalleramoPage } from './detalleramo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleramoPageRoutingModule
  ],
  declarations: [DetalleramoPage]
})
export class DetalleramoPageModule {}
