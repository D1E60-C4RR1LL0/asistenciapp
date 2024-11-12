import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import QRCode from 'qrcode';

interface Clase {
  alumnoIds: string[];
  nombre: string;
  qrDisponible?: boolean;
  idProfesor?: string[];
  currentSession?: string | null;
}

interface Alumno {
  email: string;
  nombre: string;
  asistencias?: any[];
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
  alumnos: Alumno[] = [];
  qrCodeData: string = '';
  qrCodeUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private alertController: AlertController
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

      // Suscribirse a los cambios de asistencia de cada alumno
      this.cargarAlumnos();
    }
  }

  async cargarAlumnos() {
    if (!this.clase?.currentSession) {
      console.error('No se ha definido el ID de la sesión activa en cargarAlumnos.');
      return;
    }
  
    const alumnoIds = this.clase?.alumnoIds || [];
    this.alumnos = [];
  
    for (const alumnoId of alumnoIds) {
      const alumnoDoc = await this.firestore.collection('users').doc(alumnoId).get().toPromise();
      const alumnoData = alumnoDoc?.data() as Alumno;
      if (alumnoData) {
        this.firestore.collection('classes')
          .doc(this.classId)
          .collection('sessions')
          .doc(this.clase.currentSession)
          .collection('attendance')
          .doc(alumnoId)
          .valueChanges().subscribe(asistencias => {
            const index = this.alumnos.findIndex(alumno => alumno.email === alumnoData.email);
            if (index !== -1) {
              this.alumnos[index].asistencias = asistencias ? [asistencias] : [];
            } else {
              this.alumnos.push({ ...alumnoData, asistencias: asistencias ? [asistencias] : [] });
            }
          });
      }
    }
  }
  
  

  async activarAsistencia() {
    if (this.clase) {
      const nuevoEstado = !this.clase.qrDisponible;
  
      if (nuevoEstado) {
        const sessionRef = await this.firestore.collection('classes').doc(this.classId).collection('sessions').add({
          startTime: new Date(),
          isActive: true
        });
  
        await this.firestore.collection('classes').doc(this.classId).update({
          qrDisponible: nuevoEstado,
          currentSession: sessionRef.id
        });
  
        // Asegúrate de que el ID de la sesión activa se asigna correctamente
        this.clase.currentSession = sessionRef.id;
        console.log('ID de la sesión activa asignado:', this.clase.currentSession);
      } else {
        if (this.clase.currentSession) {
          await this.marcarAusentes();
  
          await this.firestore.collection('classes').doc(this.classId).collection('sessions').doc(this.clase.currentSession).update({
            endTime: new Date(),
            isActive: false
          });
  
          await this.firestore.collection('classes').doc(this.classId).update({
            qrDisponible: nuevoEstado,
            currentSession: null
          });
  
          this.clase.currentSession = null;
        }
      }
  
      this.clase.qrDisponible = nuevoEstado;
  
      this.presentAlert(
        nuevoEstado ? 'Asistencia Activada' : 'Asistencia Desactivada',
        nuevoEstado ? 'La asistencia ahora está activada para esta clase.' : 'La asistencia ha sido desactivada.'
      );
    }
  }  
  

  async marcarAusentes() {
    const alumnoIds = this.clase?.alumnoIds || [];
    const sessionId = this.clase?.currentSession;
  
    if (!sessionId) {
      console.error('No se ha definido el ID de la sesión activa.');
      return;
    }
  
    for (const alumnoId of alumnoIds) {
      // Verificar si el alumno ya tiene un registro de asistencia en la sesión activa
      const asistenciaSnapshot = await this.firestore
        .collection('classes')
        .doc(this.classId)
        .collection('sessions')
        .doc(sessionId)
        .collection('attendance')
        .doc(alumnoId)
        .get()
        .toPromise();
  
      // Si no tiene un registro de asistencia, se le marca como ausente
      if (!asistenciaSnapshot?.exists) {
        await this.firestore
          .collection('classes')
          .doc(this.classId)
          .collection('sessions')
          .doc(sessionId)
          .collection('attendance')
          .doc(alumnoId)
          .set({
            alumnoId: alumnoId,
            date: new Date(),
            status: 'Ausente'
          });
      }
    }
  
    console.log('Ausentes marcados correctamente.');
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
