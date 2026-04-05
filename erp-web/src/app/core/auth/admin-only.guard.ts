import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthMockService } from './auth-mock.service';

export const adminOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthMockService);
  const router = inject(Router);
  const s = auth.session();
  if (!s) {
    return router.parseUrl('/login');
  }
  if (s.role !== 'admin') {
    return router.parseUrl('/trabajador/inicio');
  }
  return true;
};
