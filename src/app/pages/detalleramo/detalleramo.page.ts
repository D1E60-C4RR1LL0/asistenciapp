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
    this.cargarDetallesClase();
    this.firestore.collection('classes').doc(this.classId).valueChanges().subscribe((doc: any) => {
      if (doc) {
        this.clase = doc as Clase;
        this.clase.qrDisponible = this.clase.qrDisponible ?? false;
      }
    });
  }

  async cargarDetallesClase() {
    const claseDoc = await this.firestore.collection('classes').doc(this.classId).get().toPromise();
    this.clase = claseDoc?.data() as Clase;

    if (this.clase) {
      const profesorId = this.clase.idProfesor ? this.clase.idProfesor[0] : '';
      if (profesorId) {
        const profesorDoc = await this.firestore.collection('users').doc(profesorId).get().toPromise();
        this.profesorNombre = (profesorDoc?.data() as { name?: string })?.name || 'Desconocido';
      }

      const asistenciasSnapshot = await this.firestore.collection('attendance', ref =>
        ref.where('classId', '==', this.classId)
          .where('alumnoId', '==', this.alumnoId)
      ).get().toPromise();

      if (asistenciasSnapshot) {
        this.asistencias = asistenciasSnapshot.docs.map(doc => doc.data());
      }
    }
  }

  async marcarAsistencia() {
    if (this.clase?.qrDisponible) {
      const granted = await this.requestPermissions();
      if (!granted) {
        this.presentAlert('Permiso denegado', 'Para usar la aplicación, autorizar los permisos de cámara.');
        return;
      }

      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0 && barcodes[0].rawValue === this.classId) {
        await this.firestore.collection('attendance').add({
          alumnoId: this.alumnoId,
          classId: this.classId,
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
