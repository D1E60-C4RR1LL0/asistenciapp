import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-editarclasemodal',
  templateUrl: './editarclasemodal.page.html',
  styleUrls: ['./editarclasemodal.page.scss'],
})
export class EditarclasemodalPage implements OnInit {
  clase: any;
  profesores: any[] = [];
  alumnos: any[] = [];
  alumnosSeleccionados: string[] = []; // Alumnos seleccionados para la clase

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.cargarProfesores();
    this.cargarAlumnos();
    this.alumnosSeleccionados = this.clase.alumnoIds || []; // Inicializa los alumnos seleccionados
  }

  cargarProfesores() {
    this.firestore
      .collection('users', ref => ref.where('role', '==', 'profesor'))
      .valueChanges({ idField: 'id' })
      .subscribe(profesores => {
        this.profesores = profesores;
      });
  }

  cargarAlumnos() {
    this.firestore
      .collection('users', ref => ref.where('role', '==', 'alumno'))
      .valueChanges({ idField: 'id' })
      .subscribe(alumnos => {
        this.alumnos = alumnos;
      });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  guardarCambios() {
    // Asegurar que idProfesor sea un array
    const idProfesorArray = Array.isArray(this.clase.idProfesor)
      ? this.clase.idProfesor
      : [this.clase.idProfesor];
  
    // Actualizar los alumnos seleccionados
    this.clase.alumnoIds = this.alumnosSeleccionados;
  
    this.modalController.dismiss({
      claseActualizada: {
        id: this.clase.id, // ID de la clase
        nombre: this.clase.nombre,
        idProfesor: idProfesorArray, // Aseguramos que sea un array
        alumnoIds: this.clase.alumnoIds,
      },
    });
  }
  
}