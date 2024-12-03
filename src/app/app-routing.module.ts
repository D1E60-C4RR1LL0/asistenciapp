import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'misclases',
    loadChildren: () => import('./pages/misclases/misclases.module').then( m => m.MisclasesPageModule)
  },
  {
    path: 'asignaturas',
    loadChildren: () => import('./pages/asignaturas/asignaturas.module').then( m => m.AsignaturasPageModule)
  },
  {
    path: 'generarqr',
    loadChildren: () => import('./pages/generarqr/generarqr.module').then( m => m.GenerarqrPageModule)
  },
  {
    path: 'detalleclase/:id',
    loadChildren: () => import('./pages/detalleclase/detalleclase.module').then( m => m.DetalleclasePageModule)
  },
  {
    path: 'detalleramo/:id',
    loadChildren: () => import('./pages/detalleramo/detalleramo.module').then( m => m.DetalleramoPageModule)
  },
  {
    path: 'asistencias/:id',
    loadChildren: () => import('./pages/asistencias/asistencias.module').then( m => m.AsistenciasPageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then( m => m.AdminDashboardPageModule)
  },
  {
    path: 'admin-clases',
    loadChildren: () => import('./pages/admin-clases/admin-clases.module').then( m => m.AdminClasesPageModule)
  },
  {
    path: 'crearclasemodal',
    loadChildren: () => import('./pages/crearclasemodal/crearclasemodal.module').then( m => m.CrearclasemodalPageModule)
  },
  {
    path: 'editarclasemodal',
    loadChildren: () => import('./pages/editarclasemodal/editarclasemodal.module').then( m => m.EditarclasemodalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}  // Asegúrate de que AppRoutingModule esté exportado correctamente
