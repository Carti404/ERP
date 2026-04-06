import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ErpThemeService } from '../../core/theme/erp-theme.service';

export type WorkerPlantOperationalStatus = 'online' | 'absent' | 'no_attendance';

const WORKER_PLANT_STATUS_LABEL: Record<WorkerPlantOperationalStatus, string> = {
  online: 'En línea',
  absent: 'Ausente',
  no_attendance: 'No presente',
};

@Component({
  selector: 'app-trabajador-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './trabajador-shell.component.html',
})
export class TrabajadorShellComponent {
  private static readonly SCROLL_DELTA_MIN = 10;
  private static readonly TOP_THRESHOLD = 12;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ErpThemeService);

  protected readonly navItems = [
    { label: 'Inicio', path: '/trabajador/inicio', icon: 'dashboard', short: 'Inicio' },
    { label: 'Producción', path: '/trabajador/produccion', icon: 'factory', short: 'Prod.' },
    { label: 'Asistencia', path: '/trabajador/asistencia', icon: 'fingerprint', short: 'Asist.' },
    { label: 'Permisos', path: '/trabajador/permisos', icon: 'event_available', short: 'Perm.' },
    { label: 'Mensajes', path: '/trabajador/mensajes', icon: 'chat_bubble', short: 'Msj.' },
    { label: 'Perfil', path: '/trabajador/perfil', icon: 'account_circle', short: 'Perfil' },
  ] as const;

  protected readonly session = this.auth.session;

  protected readonly plantStatus = signal<WorkerPlantOperationalStatus>('online');

  protected readonly plantStatusLabel = computed(() => WORKER_PLANT_STATUS_LABEL[this.plantStatus()]);

  protected readonly bottomBarVisible = signal(true);

  private lastScrollTop = 0;

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

    if (st <= TrabajadorShellComponent.TOP_THRESHOLD) {
      this.bottomBarVisible.set(true);
      return;
    }

    if (Math.abs(delta) < TrabajadorShellComponent.SCROLL_DELTA_MIN) {
      return;
    }

    if (delta > 0) {
      this.bottomBarVisible.set(true);
    } else {
      this.bottomBarVisible.set(false);
    }
  }
}
