import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ErpThemeService } from '../../core/theme/erp-theme.service';

/** Estado operativo de planta (mock hasta API). */
export type PlantOperationalStatus = 'online' | 'absent' | 'no_attendance';

const PLANT_STATUS_LABEL: Record<PlantOperationalStatus, string> = {
  online: 'En línea',
  absent: 'Ausente',
  no_attendance: 'No asistió',
};

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  private static readonly SCROLL_DELTA_MIN = 10;
  private static readonly TOP_THRESHOLD = 12;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ErpThemeService);

  /** Scroll hacia abajo → visible; hacia arriba → oculta (en tope siempre visible). */
  protected readonly bottomBarVisible = signal(true);

  private lastScrollTop = 0;

  protected readonly navItems = [
    { label: 'Inicio', path: '/admin/inicio', ready: true, icon: 'home', short: 'Inicio' },
    { label: 'Producción', path: '/admin/produccion', ready: true, icon: 'precision_manufacturing', short: 'Prod.' },
    { label: 'Asistencias', path: '/admin/asistencias', ready: true, icon: 'event_available', short: 'Asist.' },
    { label: 'Permisos y vacaciones', path: '/admin/permisos', ready: true, icon: 'verified_user', short: 'Perm.' },
    { label: 'Bandeja de entrada', path: '/admin/bandeja', ready: true, icon: 'inbox', short: 'Band.' },
    { label: 'Notificaciones', path: '/admin/notificaciones', ready: true, icon: 'notifications', short: 'Notif.' },
    { label: 'Personal', path: '/admin/personal', ready: true, icon: 'group', short: 'Pers.' },
    { label: 'Parámetros', path: '/admin/parametros', ready: true, icon: 'settings', short: 'Conf.' },
  ] as const;

  protected session = this.auth.session;

  /** Cambiar a `'absent' | 'no_attendance'` para probar otros estados en mock. */
  protected readonly plantStatus = signal<PlantOperationalStatus>('online');

  protected readonly plantStatusLabel = computed(() => PLANT_STATUS_LABEL[this.plantStatus()]);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  protected onMainScroll(ev: Event): void {
    const el = ev.target;
    if (!(el instanceof HTMLElement)) {
      return;
    }
    const st = el.scrollTop;
    const delta = st - this.lastScrollTop;
    this.lastScrollTop = st;

    if (st <= AdminShellComponent.TOP_THRESHOLD) {
      this.bottomBarVisible.set(true);
      return;
    }

    if (Math.abs(delta) < AdminShellComponent.SCROLL_DELTA_MIN) {
      return;
    }

    if (delta > 0) {
      this.bottomBarVisible.set(true);
    } else {
      this.bottomBarVisible.set(false);
    }
  }
}
