import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-misclases',
  templateUrl: './misclases.page.html',
  styleUrls: ['./misclases.page.scss'],
})
export class MisclasesPage implements OnInit {
  classes: any[] = [];  // Almacena las clases del alumno

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      // Obtener el ID del usuario actual
      const userId = await this.authService.getCurrentUserId();

      if (userId) {
        // Obtén el documento del usuario actual desde la colección `users`
        const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();

        // Verificar que `userDoc` exista y contenga `classIds`
        if (userDoc && userDoc.exists) {
          const userData = userDoc.data() as { classIds: string[] }; // Especifica el tipo de `userData`

          if (userData && userData.classIds) {
            const classIds = userData.classIds;

            // Obtener detalles de cada clase usando los `classIds`
            const classPromises = classIds.map((classId: string) =>
              this.firestore.collection('classes').doc(classId).get().toPromise()
            );

            const classDocs = await Promise.all(classPromises);

            // Verificación y expansión segura de los datos de clase
            this.classes = classDocs
              .filter(doc => doc && doc.exists && doc.data())  // Filtrar documentos válidos y con datos
              .map(doc => {
                const data = doc!.data();
                return { id: doc!.id, ...(data ? data : {}) };  // Expande solo si `data` no es `undefined`
              });
          }
        }
      } else {
        console.error("No se pudo obtener el ID del usuario.");
      }
    } catch (error) {
      console.error("Error al obtener las clases:", error);
    }
  }
}
