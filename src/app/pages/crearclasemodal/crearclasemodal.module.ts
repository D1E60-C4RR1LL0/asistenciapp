import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearclasemodalPageRoutingModule } from './crearclasemodal-routing.module';

import { CrearclasemodalPage } from './crearclasemodal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearclasemodalPageRoutingModule
  ],
  declarations: [CrearclasemodalPage]
})
export class CrearclasemodalPageModule {}
