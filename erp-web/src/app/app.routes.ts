import { Routes } from '@angular/router';

import { LoginPage } from './pages/login/login';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPage },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'trabajador',
    loadChildren: () => import('./pages/trabajador/trabajador.routes').then((m) => m.TRABAJADOR_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];
