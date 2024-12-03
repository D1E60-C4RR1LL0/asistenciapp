import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  totalClasesActivas: number = 0;
  totalProfesores: number = 0;
  totalAlumnos: number = 0;
  totalAsistencias: number = 0;

  constructor(private firestore: AngularFirestore) {}

  async ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    // Clases activas
    this.firestore
      .collection('classes', ref => ref.where('qrDisponible', '==', true))
      .valueChanges()
      .subscribe(classes => {
        this.totalClasesActivas = classes.length;
      });

    // Profesores registrados
    this.firestore
      .collection('users', ref => ref.where('role', '==', 'profesor'))
      .valueChanges()
      .subscribe(profesores => {
        this.totalProfesores = profesores.length;
      });

    // Alumnos registrados
    this.firestore
      .collection('users', ref => ref.where('role', '==', 'alumno'))
      .valueChanges()
      .subscribe(alumnos => {
        this.totalAlumnos = alumnos.length;
      });

    // Total asistencias (opcional: cambia la lógica según la estructura)
    this.firestore
      .collectionGroup('attendance')
      .valueChanges()
      .subscribe(asistencias => {
        this.totalAsistencias = asistencias.length;
      });
  }
}
