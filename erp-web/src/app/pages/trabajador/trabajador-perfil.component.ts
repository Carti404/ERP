import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ErpThemeService } from '../../core/theme/erp-theme.service';

const PERFIL_COLOR_OPTIONS = [
  '#47607e',
  '#051125',
  '#e63946',
  '#2a9d8f',
  '#e9c46a',
  '#f4a261',
  '#9b59b6',
  '#34495e',
] as const;

@Component({
  selector: 'app-trabajador-perfil',
  standalone: true,
  templateUrl: './trabajador-perfil.component.html',
})
export class TrabajadorPerfilComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ErpThemeService);

  protected readonly palette = PERFIL_COLOR_OPTIONS;

  protected readonly session = this.auth.session;

  protected readonly displayName = computed(() => this.session()?.displayName ?? 'Trabajador');

  protected readonly jobLine = computed(() => {
    const s = this.session();
    return s ? `@${s.username}` : '';
  });

  protected readonly roleBadge = computed(() => {
    const r = this.session()?.role;
    return r === 'admin' ? 'Administrador' : 'Trabajador';
  });

  protected readonly selectedColor = signal<string>(PERFIL_COLOR_OPTIONS[0]);
  protected readonly pinDigits = signal<string[]>(['', '', '', '']);
  protected readonly notificationsOn = signal(true);

  protected selectColor(hex: string): void {
    this.selectedColor.set(hex);
  }

  protected isColorSelected(hex: string): boolean {
    return this.selectedColor() === hex;
  }

  protected setPinDigit(index: number, raw: string): void {
    const ch = raw.replace(/\D/g, '').slice(-1);
    this.pinDigits.update((d) => {
      const next = [...d];
      next[index] = ch;
      return next;
    });
  }

  protected onUpdatePin(): void {
    return;
  }

  protected setNotifications(v: boolean): void {
    this.notificationsOn.set(v);
  }

  protected onLogoutTerminal(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
