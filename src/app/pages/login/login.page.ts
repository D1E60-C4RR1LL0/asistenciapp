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

  ngOnInit() {
    // Limpia el formulario cada vez que se carga la página de login
    this.loginForm.reset();
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      await this.loadingService.presentLoading('Validando datos');

      try {
        await this.authService.signIn(email, password);
        await this.loadingService.dismissLoading();
        this.router.navigate(['/home']);
      } catch (error) {
        await this.loadingService.dismissLoading();

        if (typeof error === 'object' && error !== null && 'code' in error) {
          const errorCode = (error as { code: string }).code;

          if (errorCode === 'auth/wrong-password') {
            this.errorMessage = "Contraseña incorrecta. Inténtalo de nuevo.";
          } else if (errorCode === 'auth/user-not-found') {
            this.errorMessage = "Usuario no encontrado. Verifica tu correo.";
          } else {
            this.errorMessage = "Error en la autenticación. Revisa los datos ingresados.";
          }
        } else {
          this.errorMessage = "Ocurrió un error inesperado. Inténtalo nuevamente.";
        }
      }
    } else {
      this.errorMessage = "Por favor, completa el formulario correctamente.";
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
