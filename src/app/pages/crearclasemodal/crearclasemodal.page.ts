import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-crearclasemodal',
  templateUrl: './crearclasemodal.page.html',
  styleUrls: ['./crearclasemodal.page.scss'],
})
export class CrearclasemodalPage implements OnInit {

  nombreClase: string = '';
  profesorSeleccionado: string = '';
  profesores: any[] = [];

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.cargarProfesores();
  }

  cargarProfesores() {
    this.firestore
      .collection('users', ref => ref.where('role', '==', 'profesor'))
      .valueChanges({ idField: 'id' })
      .subscribe(profesores => {
        this.profesores = profesores;
      });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  crearClase() {
    if (!this.nombreClase || !this.profesorSeleccionado) {
      console.error('Faltan datos para crear la clase.');
      return;
    }

    const nuevaClase = {
      nombre: this.nombreClase,
      idProfesor: [this.profesorSeleccionado],
      alumnoIds: [],
      qrDisponible: false,
    };

    this.modalController.dismiss({ nuevaClase });
  }
}