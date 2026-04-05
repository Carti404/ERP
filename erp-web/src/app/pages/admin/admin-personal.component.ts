import { Component } from '@angular/core';

import {
  ADMIN_PERSONAL_KPIS,
  ADMIN_PERSONAL_WORKERS,
  type AdminPersonalPinState,
  type AdminPersonalWorkerMock,
} from './admin-personal.mock';

@Component({
  selector: 'app-admin-personal',
  standalone: true,
  templateUrl: './admin-personal.component.html',
})
export class AdminPersonalComponent {
  protected readonly kpis = ADMIN_PERSONAL_KPIS;
  protected readonly workers = ADMIN_PERSONAL_WORKERS;

  protected roleBadgeClass(w: AdminPersonalWorkerMock): string {
    const base = 'rounded px-2 py-1 text-[10px] font-bold uppercase';
    if (w.roleType === 'admin') {
      return `${base} bg-[#1b263b] text-white`;
    }
    if (w.inactive) {
      return `${base} bg-[#e1e3e4] text-[#45474d] dark:bg-[var(--erp-login-input-border)] dark:text-[var(--erp-login-muted)]`;
    }
    return `${base} bg-[#e7e8e9] text-[#3c475d] dark:bg-[var(--erp-login-surface)] dark:text-[var(--erp-login-text-primary)]`;
  }

  protected pinIcon(pin: AdminPersonalPinState): string {
    if (pin === 'active') {
      return 'lock_open';
    }
    if (pin === 'inactive') {
      return 'lock_clock';
    }
    return 'lock';
  }

  protected pinTitle(pin: AdminPersonalPinState): string {
    if (pin === 'active') {
      return 'PIN activo';
    }
    if (pin === 'inactive') {
      return 'PIN inactivo';
    }
    return 'PIN bloqueado';
  }

  protected pinIconClass(pin: AdminPersonalPinState): string {
    if (pin === 'active') {
      return 'text-[#47607e]';
    }
    if (pin === 'inactive') {
      return 'text-[#45474d] dark:text-[var(--erp-login-muted)]';
    }
    return 'text-[#ba1a1a]';
  }

  protected onAddWorker(): void {
    return;
  }

  protected onFilter(): void {
    return;
  }

  protected onRowHistory(_w: AdminPersonalWorkerMock): void {
    return;
  }

  protected onRowEdit(_w: AdminPersonalWorkerMock): void {
    return;
  }

  protected onRowDeactivate(_w: AdminPersonalWorkerMock): void {
    return;
  }

  protected onReactivate(_w: AdminPersonalWorkerMock): void {
    return;
  }

  protected onPage(_n: number): void {
    return;
  }
}
