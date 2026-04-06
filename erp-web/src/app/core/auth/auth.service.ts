import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { apiBaseUrl } from '../environment';
import { ERP_AUTH_STORAGE_KEY } from './auth-storage';

export type UserRole = 'admin' | 'worker';

export interface ErpSession {
  accessToken: string;
  userId: string;
  username: string;
  role: UserRole;
  displayName: string;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    role: UserRole;
    displayName: string;
    username: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<ErpSession | null>(null);

  constructor(private readonly http: HttpClient) {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    try {
      const raw = globalThis.sessionStorage?.getItem(ERP_AUTH_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as ErpSession;
      if (
        parsed?.accessToken &&
        parsed?.userId &&
        (parsed.role === 'admin' || parsed.role === 'worker')
      ) {
        this.session.set(parsed);
      }
    } catch {
      globalThis.sessionStorage?.removeItem(ERP_AUTH_STORAGE_KEY);
    }
  }

  private persist(s: ErpSession | null): void {
    if (!s) {
      globalThis.sessionStorage?.removeItem(ERP_AUTH_STORAGE_KEY);
      return;
    }
    globalThis.sessionStorage?.setItem(ERP_AUTH_STORAGE_KEY, JSON.stringify(s));
  }

  /**
   * Login solo con PIN de 4 dígitos; el backend identifica al usuario (PIN único entre activos).
   */
  signIn(pin: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${apiBaseUrl}/auth/login`, {
        pin,
      })
      .pipe(
        tap((res) => {
          const session: ErpSession = {
            accessToken: res.accessToken,
            userId: res.user.id,
            username: res.user.username,
            role: res.user.role,
            displayName: res.user.displayName,
          };
          this.session.set(session);
          this.persist(session);
        }),
      );
  }

  logout(): void {
    const token = this.session()?.accessToken;
    this.clearLocal();
    if (token) {
      this.http
        .post(`${apiBaseUrl}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({ error: () => undefined });
    }
  }

  private clearLocal(): void {
    this.session.set(null);
    this.persist(null);
  }

  homeUrlForRole(role: UserRole): string {
    return role === 'admin' ? '/admin/inicio' : '/trabajador/inicio';
  }
}
