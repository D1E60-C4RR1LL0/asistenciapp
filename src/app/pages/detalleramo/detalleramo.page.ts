import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AuthService } from '../../services/auth.service';

interface Clase {
  alumnoIds: string[];
  nombre: string;
  qrDisponible?: boolean;
  idProfesor?: string[];
  currentSession?: string | null;
}

@Component({
  selector: 'app-detalleramo',
  templateUrl: './detalleramo.page.html',
  styleUrls: ['./detalleramo.page.scss'],
})
export class DetalleramoPage implements OnInit {
  classId: string = '';
  clase: Clase | undefined;
  profesorNombre: string = '';
  asistencias: any[] = [];
  isSupported = false;
  alumnoId: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    this.classId = this.route.snapshot.paramMap.get('id') || '';
  }

  async ngOnInit() {
    this.alumnoId = await this.authService.getCurrentUserId() || '';
    const supportResult = await BarcodeScanner.isSupported();
    this.isSupported = supportResult.supported;

    // Cargar detalles de la clase y la asistencia del alumno una vez
    await this.cargarDetallesClase();
    this.cargarHistorialAsistenciasAlumno();
  }

  async cargarDetallesClase() {
    const claseDoc = await this.firestore.collection('classes').doc(this.classId).get().toPromise();
    this.clase = claseDoc?.data() as Clase;
    console.log('Detalles de la clase:', this.clase);

    if (this.clase) {
      const profesorId = this.clase.idProfesor ? this.clase.idProfesor[0] : '';
      if (profesorId) {
        const profesorDoc = await this.firestore.collection('users').doc(profesorId).get().toPromise();
        this.profesorNombre = (profesorDoc?.data() as { name?: string })?.name || 'Desconocido';
        console.log('Nombre del profesor:', this.profesorNombre);
      }
    }
  }

  cargarHistorialAsistenciasAlumno() {
    this.asistencias = []; // Reiniciar el array de asistencias para almacenar el historial completo
  
    // Acceder a todas las sesiones de la clase
    this.firestore.collection('classes')
      .doc(this.classId)
      .collection('sessions')
      .get()
      .toPromise()
      .then(sessionsSnapshot => {
        if (!sessionsSnapshot) {
          console.error('No se encontraron sesiones para esta clase.');
          return;
        }
  
        sessionsSnapshot.forEach(sessionDoc => {
          const sessionId = sessionDoc.id;
          const sessionDate = (sessionDoc.data() as { startTime: any }).startTime.toDate();
  
          // Para cada sesión, obtener la asistencia del alumno
          this.firestore.collection('classes')
            .doc(this.classId)
            .collection('sessions')
            .doc(sessionId)
            .collection('attendance', ref => ref.where('alumnoId', '==', this.alumnoId))
            .get()
            .toPromise()
            .then(attendanceSnapshot => {
              if (!attendanceSnapshot) {
                console.error(`No se encontraron registros de asistencia para el alumno en la sesión ${sessionId}.`);
                return;
              }
  
              attendanceSnapshot.forEach(attendanceDoc => {
                const attendanceData = attendanceDoc.data() as { status: string; date: any };
                this.asistencias.push({
                  date: sessionDate,
                  status: attendanceData.status
                });
              });
  
              // Ordenar las asistencias de más reciente a más antigua
              this.asistencias.sort((a, b) => b.date.getTime() - a.date.getTime());
            })
            .catch(error => {
              console.error('Error al obtener la asistencia del alumno en la sesión:', error);
            });
        });
      })
      .catch(error => {
        console.error('Error al cargar las sesiones de la clase:', error);
      });
  }
  
  
  async marcarAsistencia() {
    if (this.clase?.qrDisponible) {
      const granted = await this.requestPermissions();
      if (!granted) {
        this.presentAlert('Permiso denegado', 'Para usar la aplicación, autorizar los permisos de cámara.');
        return;
      }

      const { barcodes } = await BarcodeScanner.scan();
      console.log('Código QR escaneado:', barcodes[0].rawValue);
      if (barcodes.length > 0 && barcodes[0].rawValue === this.classId) {
        const sessionId = this.clase?.currentSession;
        if (!sessionId) {
          console.error('No se ha definido el ID de la sesión activa.');
          return;
        }

        await this.firestore
          .collection('classes')
          .doc(this.classId)
          .collection('sessions')
          .doc(sessionId)
          .collection('attendance')
          .doc(this.alumnoId)
          .set({
            alumnoId: this.alumnoId,
            date: new Date(),
            status: 'Presente'
          });

        this.presentAlert('Asistencia Registrada', 'Tu asistencia ha sido registrada exitosamente.');
      } else {
        this.presentAlert('Error', 'Código QR no válido para esta clase.');
      }
    } else {
      this.presentAlert('Asistencia No Disponible', 'El profesor no ha activado la validación de asistencia.');
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
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
