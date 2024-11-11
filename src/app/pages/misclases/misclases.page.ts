import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-misclases',
  templateUrl: './misclases.page.html',
  styleUrls: ['./misclases.page.scss'],
})
export class MisclasesPage implements OnInit {
  clases: any[] = [];

  constructor(private firestore: AngularFirestore, private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const alumnoId = await this.authService.getCurrentUserId();
    console.log("Alumno ID:", alumnoId);  // Verifica el ID del alumno

    // Consulta para obtener todas las clases donde el alumno está registrado
    this.firestore.collection('classes', ref => ref.where('alumnoIds', 'array-contains', alumnoId))
      .valueChanges({ idField: 'id' })
      .subscribe((clasesData: any[]) => {
        console.log("Clases encontradas:", clasesData);  // Verifica las clases obtenidas
        this.clases = clasesData;
      });
  }
  
  verDetalles(classId: string) {
    this.router.navigate(['/detalleramo', classId]);
  }
}
