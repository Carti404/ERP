import { Routes } from '@angular/router';

import { workerOnlyGuard } from '../../core/auth/worker-only.guard';
import { TrabajadorAsistenciasComponent } from './trabajador-asistencias.component';
import { TrabajadorHomeComponent } from './trabajador-home.component';
import { TrabajadorMensajesComponent } from './trabajador-mensajes.component';
import { TrabajadorPerfilComponent } from './trabajador-perfil.component';
import { TrabajadorPermisosComponent } from './trabajador-permisos.component';
import { TrabajadorProduccionComponent } from './trabajador-produccion.component';
import { TrabajadorShellComponent } from './trabajador-shell.component';

export const TRABAJADOR_ROUTES: Routes = [
  {
    path: '',
    component: TrabajadorShellComponent,
    canActivate: [workerOnlyGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', component: TrabajadorHomeComponent },
      { path: 'produccion', component: TrabajadorProduccionComponent },
      { path: 'asistencia', component: TrabajadorAsistenciasComponent },
      { path: 'permisos', component: TrabajadorPermisosComponent },
      { path: 'mensajes', component: TrabajadorMensajesComponent },
      { path: 'perfil', component: TrabajadorPerfilComponent },
    ],
  },
];
