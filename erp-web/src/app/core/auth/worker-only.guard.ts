import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const workerOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const s = auth.session();
  if (!s) {
    return router.parseUrl('/login');
  }
  if (s.role !== 'worker') {
    return router.parseUrl('/admin/inicio');
  }
  return true;
};
