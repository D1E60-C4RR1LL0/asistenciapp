import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storage: Storage) {}

  async canActivate(route: any): Promise<boolean> {
    const userRole = await this.storage.get('userRole');

    if (userRole) {
      // Si el usuario tiene un rol, ya ha iniciado sesión, así que redirigir a home
      if (route.routeConfig.path === 'login' || route.routeConfig.path === 'register') {
        this.router.navigate(['/home']);
        return false;
      }
      return true;
    } else {
      // Si no tiene un rol, redirigir a login
      if (route.routeConfig.path === 'home') {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }
  }
}
