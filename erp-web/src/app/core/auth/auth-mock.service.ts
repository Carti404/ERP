import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'worker';

export interface MockSession {
  role: UserRole;
  displayName: string;
}

const STORAGE_KEY = 'erp-mock-session';

/** Sesión demo hasta integrar API y BD. PIN → rol (sin usuario explícito en UI). */
@Injectable({ providedIn: 'root' })
export class AuthMockService {
  readonly session = signal<MockSession | null>(null);

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    try {
      const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as MockSession;
      if (parsed?.role === 'admin' || parsed?.role === 'worker') {
        this.session.set({
          role: parsed.role,
          displayName: parsed.displayName ?? (parsed.role === 'admin' ? 'Administrador' : 'Trabajador'),
        });
      }
    } catch {
      globalThis.sessionStorage?.removeItem(STORAGE_KEY);
    }
  }

  private persist(s: MockSession | null): void {
    if (!s) {
      globalThis.sessionStorage?.removeItem(STORAGE_KEY);
      return;
    }
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  /**
   * Valida PIN mock. `0000` administrador, `1234` trabajador.
   * @returns rol si es válido, `null` si no.
   */
  signInWithPin(pin: string): UserRole | null {
    let session: MockSession | null = null;
    if (pin === '0000') {
      session = { role: 'admin', displayName: 'Administrador (demo)' };
    } else if (pin === '1234') {
      session = { role: 'worker', displayName: 'Trabajador (demo)' };
    }
    if (!session) {
      return null;
    }
    this.session.set(session);
    this.persist(session);
    return session.role;
  }

  logout(): void {
    this.session.set(null);
    this.persist(null);
  }

  homeUrlForRole(role: UserRole): string {
    return role === 'admin' ? '/admin/inicio' : '/trabajador/inicio';
  }
}
