import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CrearclasemodalPage } from '../crearclasemodal/crearclasemodal.page';
import { EditarclasemodalPage } from '../editarclasemodal/editarclasemodal.page';

@Component({
  selector: 'app-admin-clases',
  templateUrl: './admin-clases.page.html',
  styleUrls: ['./admin-clases.page.scss'],
})
export class AdminClasesPage implements OnInit {

  clases: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarClases();
  }

  cargarClases() {
    this.firestore
      .collection('classes')
      .valueChanges({ idField: 'id' })
      .subscribe((clases: any[]) => {
        this.clases = clases.map(clase => ({
          ...clase,
          profesorNombre: '',
        }));

        // Cargar nombres de los profesores para cada clase
        this.clases.forEach(clase => {
          if (Array.isArray(clase.idProfesor) && clase.idProfesor.length > 0) {
            this.firestore
              .collection('users')
              .doc(clase.idProfesor[0])
              .valueChanges()
              .subscribe(profesor => {
                clase.profesorNombre = (profesor as any)?.name || 'Sin asignar';
              });
          }
        });
        
      });
  }

  async abrirCrearClaseModal() {
    const modal = await this.modalController.create({
      component: CrearclasemodalPage, 
    });

    modal.onDidDismiss().then(({ data }) => {
      if (data && data.nuevaClase) {
        this.firestore.collection('classes').add(data.nuevaClase);
      }
    });

    await modal.present();
  }

  async abrirEditarClaseModal(clase: any) {
    const modal = await this.modalController.create({
      component: EditarclasemodalPage,
      componentProps: { clase }, 
    });
  
    modal.onDidDismiss().then(({ data }) => {
      if (data && data.claseActualizada) {
        const { id, ...restoDatos } = data.claseActualizada;
        this.firestore.collection('classes').doc(id).update(restoDatos);
      }
    });
  
    await modal.present();
  }


  async eliminarClase(claseId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de eliminar esta clase?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.firestore.collection('classes').doc(claseId).delete();
          },
        },
      ],
    });
    await alert.present();
  }
}