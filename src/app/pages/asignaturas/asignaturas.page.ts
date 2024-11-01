import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.page.html',
  styleUrls: ['./asignaturas.page.scss'],
})
export class AsignaturasPage implements OnInit {
  asignaturas: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const profesorId = await this.authService.getCurrentUserId();

    if (profesorId) {
      // Obtener las asignaturas donde el profesor es el docente asignado
      this.firestore.collection('classes', ref => ref.where('idProfesor', 'array-contains', profesorId))
        .valueChanges({ idField: 'id' })  // Incluye el ID del documento
        .subscribe((data) => {
          this.asignaturas = data;
        });
    }
  }
}
