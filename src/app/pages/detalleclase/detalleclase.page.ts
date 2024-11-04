import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface Clase {
  alumnoIds: string[];
  nombre: string;
}

@Component({
  selector: 'app-detalle-clase',
  templateUrl: './detalleclase.page.html',
  styleUrls: ['./detalleclase.page.scss'],
})
export class DetalleclasePage implements OnInit {
  classId: string = '';
  alumnos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    // Obtener el `classId` desde los parámetros de la ruta
    this.classId = this.route.snapshot.paramMap.get('id') || '';

    if (this.classId) {
      // Consultar la lista de alumnos en Firestore
      this.firestore.collection('classes').doc(this.classId).get().subscribe(doc => {
        const classData = doc.data() as Clase; // Aseguramos que el dato sea del tipo `Clase`
        const alumnoIds = classData?.alumnoIds || [];

        // Obtener los detalles de cada alumno usando sus IDs
        alumnoIds.forEach((alumnoId: string) => {
          this.firestore.collection('users').doc(alumnoId).get().subscribe(alumnoDoc => {
            const alumnoData = alumnoDoc.data();
            if (alumnoData) {
              this.alumnos.push(alumnoData);
            }
          });
        });
      });
    }
  }
}
