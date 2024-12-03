import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarclasemodalPageRoutingModule } from './editarclasemodal-routing.module';

import { EditarclasemodalPage } from './editarclasemodal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarclasemodalPageRoutingModule
  ],
  declarations: [EditarclasemodalPage]
})
export class EditarclasemodalPageModule {}
