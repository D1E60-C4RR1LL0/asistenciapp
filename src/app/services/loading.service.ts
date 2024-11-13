import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) {}

  // Mostrar el spinner
  async presentLoading(message: string = 'Cargando...') {
    if (!this.loading) {
      this.loading = await this.loadingController.create({
        message,
        spinner: 'crescent', // Tipo de spinner
        cssClass: 'custom-loading' // Clase CSS personalizada
      });
      await this.loading.present();
    }
  }

  // Ocultar el spinner
  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }
}
