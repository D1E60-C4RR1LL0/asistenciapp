import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Inicialización necesaria para el componente
    console.log('LoginPage inicializado');
  }
  

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      await this.loadingService.presentLoading('Validando datos');
  
      if (navigator.onLine) {
        try {
          const userCredential = await this.authService.signIn(email, password);
          const uid = userCredential.user?.uid;
      
          if (uid) {
            // Obtén información adicional del usuario desde Firestore (si es necesario)
            const userDoc = await this.authService.getUserData(uid);
      
            if (userDoc) {
              console.log('Usuario autenticado online:', userDoc);
      
              // Guardar datos del usuario en localStorage para uso offline
              await this.authService.saveUserLocally(userDoc, password);
      
              await this.loadingService.dismissLoading();
              if (this.router.url !== '/home') {
                this.router.navigate(['/home']);
              }
            } else {
              throw new Error('No se pudo obtener información del usuario.');
            }
          } else {
            throw new Error('UID del usuario no disponible.');
          }
        } catch (error) {
          await this.loadingService.dismissLoading();
          this.errorMessage = 'Error en la autenticación online. Verifica tus datos.';
          console.error(error);
        }
      }else {
        // Modo offline
        try {
          const localUsers = await this.authService.getUsers(); // Obtener usuarios locales
          const user = localUsers.find((u: any) => u.email === email);
      
          // Validar usuario y contraseña
          if (user && user.password === password) {
            console.log('Usuario autenticado offline:', user);
            await this.loadingService.dismissLoading();
            if (this.router.url !== '/home') {
              this.router.navigate(['/home']);
            }
          } else {
            await this.loadingService.dismissLoading();
            this.errorMessage = 'Correo o contraseña incorrectos en modo offline.';
          }
        } catch (error) {
          await this.loadingService.dismissLoading();
          this.errorMessage = 'Error en el inicio de sesión offline.';
          console.error(error);
        }
      }
      
    } else {
      this.errorMessage = 'Por favor, completa el formulario correctamente.';
    }
  }
  


  goToRegister() {
    this.router.navigate(['/register']);
  }
}
