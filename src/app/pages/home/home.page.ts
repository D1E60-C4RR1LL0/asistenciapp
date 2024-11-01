import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userRole: string = '';

  constructor(
    private storage: Storage,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Carga el rol del usuario desde Ionic Storage
    this.userRole = await this.storage.get('userRole');
  }

  async onLogout() {
    await this.authService.signOut();  // Redirige al login desde el servicio
  }
}
