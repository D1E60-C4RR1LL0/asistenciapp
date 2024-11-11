import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import QRCode from 'qrcode';

interface Clase {
  alumnoIds: string[];
  nombre: string;
  qrDisponible?: boolean;
  idProfesor?: string[];
}

@Component({
  selector: 'app-detalleclase',
  templateUrl: './detalleclase.page.html',
  styleUrls: ['./detalleclase.page.scss'],
})
export class DetalleclasePage implements OnInit {
  classId: string = '';
  clase: Clase | undefined;
  profesorNombre: string = '';
  alumnos: any[] = [];
  qrCodeData: string = '';
  qrCodeUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    this.classId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    if (this.classId) {
      this.cargarClase();
    }
  }

  async cargarClase() {
    const claseDoc = await this.firestore.collection('classes').doc(this.classId).get().toPromise();
    this.clase = claseDoc?.data() as Clase;

    if (this.clase) {
      const profesorId = this.clase.idProfesor ? this.clase.idProfesor[0] : '';
      if (profesorId) {
        const profesorDoc = await this.firestore.collection('users').doc(profesorId).get().toPromise();
        this.profesorNombre = (profesorDoc?.data() as { name?: string })?.name || 'Desconocido';
      }

      this.cargarAlumnos();
    }
  }

  async cargarAlumnos() {
    const alumnoIds = this.clase?.alumnoIds || [];
    this.alumnos = [];

    for (const alumnoId of alumnoIds) {
      const alumnoDoc = await this.firestore.collection('users').doc(alumnoId).get().toPromise();
      const alumnoData = alumnoDoc?.data();
      if (alumnoData) {
        const asistenciasSnapshot = await this.firestore.collection('attendance', ref =>
          ref.where('classId', '==', this.classId).where('alumnoId', '==', alumnoId)
        ).get().toPromise();

        const asistencias = asistenciasSnapshot?.docs.map(doc => doc.data()) || [];
        this.alumnos.push({ ...alumnoData, asistencias });
      }
    }
  }

  async activarAsistencia() {
    if (this.clase) {
        const nuevoEstado = !this.clase.qrDisponible;
        await this.firestore.collection('classes').doc(this.classId).update({ qrDisponible: nuevoEstado });
        
        // Actualiza el estado local para reflejar el cambio de inmediato
        this.clase.qrDisponible = nuevoEstado;
        
        this.presentAlert(
            nuevoEstado ? 'Asistencia Activada' : 'Asistencia Desactivada',
            nuevoEstado ? 'La asistencia ahora está activada para esta clase.' : 'La asistencia ha sido desactivada.'
        );
    }
}

  async generarCodigoQR() {
    this.qrCodeData = this.classId;
    this.qrCodeUrl = await QRCode.toDataURL(this.qrCodeData);
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
