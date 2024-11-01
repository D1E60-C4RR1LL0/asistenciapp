import { LoadingService } from './../../services/loading.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,  // Para redirigir al login
    private toastController: ToastController,  // Para mostrar un mensaje de éxito
    private loadingService: LoadingService //Iinjecta el servicio de carga
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  // Validador para confirmar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  // Función para mostrar un Toast de éxito
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  // Función de registro
  async onRegister() {
    if (this.registerForm.valid) {
      const { email, password, role, name } = this.registerForm.value;

      await this.loadingService.presentLoading('Creando cuenta...');

      try {
        await this.authService.signUp(email, password, role, name);
        await this.loadingService.dismissLoading(); //Oculta el Spinner
        
        // Mostrar mensaje de éxito
        await this.presentToast('Registro exitoso. Por favor, inicia sesión.');

        // Redirigir al usuario a la página de login
        this.router.navigate(['/login']);
      } catch (error) {
        console.error(error); // Manejo de errores
        this.errorMessage = "Hubo un error al registrarse. Inténtalo de nuevo.";
      }
    } else {
      this.errorMessage = "Por favor, completa todos los campos correctamente.";
    }
  }
}
