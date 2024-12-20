import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { LoadingService } from '../../services/loading.service';  // Asegúrate de que la ruta sea correcta

interface SesionAsistencia {
  claseNombre: string;
  fecha: Date;
  alumnos: {
    nombre: string;
    estado: string;
  }[];
  showAlumnos: boolean;
  sessionId: string; // Agrega sessionId aquí para que sea reconocido
}

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
})
export class AsistenciasPage implements OnInit {
  classId: string = '';
  sesiones: SesionAsistencia[] = [];

  constructor(
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private loadingService: LoadingService  // Inyecta el servicio de carga
  ) {
    this.classId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    if (this.classId) {
      this.cargarAsistenciasGenerales();
    }
  }

  async cargarAsistenciasGenerales() {
    try {
      await this.loadingService.presentLoading('Cargando asistencias');  // Muestra el spinner

      const claseDoc = await this.firestore.collection('classes').doc(this.classId).get().toPromise();
      const claseNombre = (claseDoc?.data() as { nombre?: string })?.nombre || 'Clase Desconocida';
  
      this.firestore.collection('classes').doc(this.classId).collection('sessions')
        .snapshotChanges().pipe(
          map(snapshots => snapshots.map(sesionDoc => {
            const sesionData = sesionDoc.payload.doc.data();
            const fechaSesion = (sesionData as { startTime?: any })['startTime']?.toDate();
            const sessionId = sesionDoc.payload.doc.id;
  
            return { fechaSesion, sessionId };
          }))
        ).subscribe(async sesiones => {
          const sesionesData: SesionAsistencia[] = [];
  
          for (const sesion of sesiones) {
            const asistenciasSnapshot = await this.firestore
              .collection('classes')
              .doc(this.classId)
              .collection('sessions')
              .doc(sesion.sessionId)
              .collection('attendance')
              .get()
              .toPromise();
  
            const alumnosAsistencia = await Promise.all(
              asistenciasSnapshot?.docs.map(async asistenciaDoc => {
                const asistenciaData = asistenciaDoc.data() as { alumnoId: string; status: string };
                const alumnoId = asistenciaData.alumnoId;
                const alumnoDoc = await this.firestore.collection('users').doc(alumnoId).get().toPromise();
                const alumnoNombre = (alumnoDoc?.data() as { name?: string })?.name || 'Nombre Desconocido';
  
                return {
                  nombre: alumnoNombre,
                  estado: asistenciaData['status'] || 'Desconocido'
                };
              }) || []
            );
  
            if (sesion.fechaSesion) {
              sesionesData.push({
                claseNombre: claseNombre,
                fecha: sesion.fechaSesion,
                alumnos: alumnosAsistencia,
                showAlumnos: false,
                sessionId: sesion.sessionId  // Asegúrate de incluir sessionId aquí
              });
            }
          }
  
          // Ordena las sesiones por fecha (de más reciente a más antigua)
          this.sesiones = sesionesData.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

          await this.loadingService.dismissLoading();  // Oculta el spinner después de cargar los datos
        });
    } catch (error) {
      console.error('Error al cargar las asistencias generales:', error);
      await this.loadingService.dismissLoading();  // Asegura que el spinner se oculta en caso de error
    }
  }
}
