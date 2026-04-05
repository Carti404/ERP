import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'erp-theme-preference';

/** Tema claro/oscuro: misma clave que el login (`localStorage`). */
@Injectable({ providedIn: 'root' })
export class ErpThemeService {
  private readonly doc = inject(DOCUMENT);

  readonly isDark = signal(false);

  constructor() {
    this.applyFromStorageOrSystem();
  }

  private applyFromStorageOrSystem(): void {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'light') {
      this.doc.documentElement.classList.remove('dark');
      this.isDark.set(false);
      return;
    }
    if (stored === 'dark') {
      this.doc.documentElement.classList.add('dark');
      this.isDark.set(true);
      return;
    }
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    this.doc.documentElement.classList.toggle('dark', prefersDark);
    this.isDark.set(prefersDark);
  }

  toggle(): void {
    const next = !this.doc.documentElement.classList.contains('dark');
    this.doc.documentElement.classList.toggle('dark', next);
    globalThis.localStorage?.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    this.isDark.set(next);
  }

  /** Seguir `prefers-color-scheme` solo si el usuario no guardó preferencia manual. */
  bindSystemPreferenceWhenUnset(destroyRef: DestroyRef): void {
    const mql = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (globalThis.localStorage?.getItem(STORAGE_KEY)) {
        return;
      }
      const prefersDark = mql.matches;
      this.doc.documentElement.classList.toggle('dark', prefersDark);
      this.isDark.set(prefersDark);
    };
    mql.addEventListener('change', onChange);
    destroyRef.onDestroy(() => mql.removeEventListener('change', onChange));
  }
}
