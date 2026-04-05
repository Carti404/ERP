import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthMockService } from '../../core/auth/auth-mock.service';
import { ErpThemeService } from '../../core/theme/erp-theme.service';
import { TRABAJADOR_PERFIL_BADGE, TRABAJADOR_PERFIL_COLORS, TRABAJADOR_PERFIL_JOB } from './trabajador-perfil.mock';

@Component({
  selector: 'app-trabajador-perfil',
  standalone: true,
  templateUrl: './trabajador-perfil.component.html',
})
export class TrabajadorPerfilComponent {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ErpThemeService);

  protected readonly job = TRABAJADOR_PERFIL_JOB;
  protected readonly badge = TRABAJADOR_PERFIL_BADGE;
  protected readonly palette = TRABAJADOR_PERFIL_COLORS;

  protected readonly session = this.auth.session;
  protected readonly displayName = computed(() => this.session()?.displayName ?? 'Trabajador');

  protected readonly selectedColor = signal<string>(TRABAJADOR_PERFIL_COLORS[0]);
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
