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
    console.log('Alumno ID obtenido:', this.alumnoId); // Log para verificar el alumno ID
  
    const supportResult = await BarcodeScanner.isSupported();
    this.isSupported = supportResult.supported;
    console.log('Soporte para el escáner:', this.isSupported); // Log para el soporte del escáner
  
    await this.cargarDetallesClase();
    this.cargarHistorialAsistenciasAlumno();
  }

  async cargarDetallesClase() {
    try {
      const claseDoc = await this.firestore.collection('classes').doc(this.classId).get().toPromise();
      this.clase = claseDoc?.data() as Clase;
      console.log('Detalles de la clase cargados:', this.clase);
  
      if (this.clase) {
        const profesorId = this.clase.idProfesor ? this.clase.idProfesor[0] : '';
        console.log('ID del profesor:', profesorId); // Log para el ID del profesor
  
        if (profesorId) {
          const profesorDoc = await this.firestore.collection('users').doc(profesorId).get().toPromise();
          this.profesorNombre = (profesorDoc?.data() as { name?: string })?.name || 'Desconocido';
          console.log('Nombre del profesor cargado:', this.profesorNombre);
        }
      }
    } catch (error) {
      console.error('Error al cargar los detalles de la clase:', error);
    }
  }
  

  cargarHistorialAsistenciasAlumno() {
    this.asistencias = []; // Reiniciar el array de asistencias para almacenar el historial completo
    console.log('Iniciando carga de historial de asistencias para el alumno:', this.alumnoId);
  
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
  
        console.log('Sesiones encontradas:', sessionsSnapshot.size);
  
        sessionsSnapshot.forEach(sessionDoc => {
          const sessionId = sessionDoc.id;
          const sessionData = sessionDoc.data();
          console.log(`Sesión ID: ${sessionId}`, sessionData);
  
          const sessionDate = (sessionData as { startTime: any }).startTime?.toDate();
          if (!sessionDate) {
            console.error(`No se encontró la fecha para la sesión ${sessionId}`);
            return;
          }
  
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
  
              console.log(`Asistencias encontradas para la sesión ${sessionId}:`, attendanceSnapshot.size);
  
              attendanceSnapshot.forEach(attendanceDoc => {
                const attendanceData = attendanceDoc.data() as { status: string; date: any };
                console.log(`Asistencia cargada:`, attendanceData);
  
                this.asistencias.push({
                  date: sessionDate,
                  status: attendanceData.status
                });
              });
  
              // Ordenar las asistencias de más reciente a más antigua
              this.asistencias.sort((a, b) => b.date.getTime() - a.date.getTime());
              console.log('Asistencias ordenadas:', this.asistencias);
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
    try {
      if (this.clase?.qrDisponible) {
        const granted = await this.requestPermissions();
        console.log('Permiso de cámara concedido:', granted);
  
        if (!granted) {
          this.presentAlert('Permiso denegado', 'Para usar la aplicación, autorizar los permisos de cámara.');
          return;
        }
  
        const { barcodes } = await BarcodeScanner.scan();
        console.log('Código QR escaneado:', barcodes[0]?.rawValue);
  
        if (barcodes.length > 0 && barcodes[0].rawValue === this.classId) {
          const sessionId = this.clase?.currentSession;
          console.log('ID de la sesión actual:', sessionId);
  
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
    } catch (error) {
      console.error('Error al marcar la asistencia:', error);
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
