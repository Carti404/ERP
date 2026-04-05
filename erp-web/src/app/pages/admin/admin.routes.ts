import { Routes } from '@angular/router';

import { adminOnlyGuard } from '../../core/auth/admin-only.guard';
import { AdminAsistenciasComponent } from './admin-asistencias.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminInboxComponent } from './admin-inbox.component';
import { AdminNotificacionesComponent } from './admin-notificaciones.component';
import { AdminParametrosComponent } from './admin-parametros.component';
import { AdminPersonalComponent } from './admin-personal.component';
import { AdminPermisosComponent } from './admin-permisos.component';
import { AdminProduccionComponent } from './admin-produccion.component';
import { AdminShellComponent } from './admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [adminOnlyGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', component: AdminDashboardComponent },
      { path: 'produccion', component: AdminProduccionComponent },
      { path: 'asistencias', component: AdminAsistenciasComponent },
      { path: 'permisos', component: AdminPermisosComponent },
      { path: 'bandeja', component: AdminInboxComponent },
      { path: 'parametros', component: AdminParametrosComponent },
      { path: 'notificaciones', component: AdminNotificacionesComponent },
      { path: 'personal', component: AdminPersonalComponent },
    ],
  },
];
