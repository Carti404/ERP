import { HttpInterceptorFn } from '@angular/common/http';

import { ERP_AUTH_STORAGE_KEY } from './auth-storage';

export const erpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login')) {
    return next(req);
  }
  try {
    const raw = globalThis.sessionStorage?.getItem(ERP_AUTH_STORAGE_KEY);
    if (!raw) {
      return next(req);
    }
    const parsed = JSON.parse(raw) as { accessToken?: string };
    if (!parsed?.accessToken) {
      return next(req);
    }
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${parsed.accessToken}` },
      }),
    );
  } catch {
    return next(req);
  }
};
