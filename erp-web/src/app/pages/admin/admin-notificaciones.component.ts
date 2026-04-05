import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ADMIN_NOTIF_HR,
  ADMIN_NOTIF_INBOX,
  ADMIN_NOTIF_PRODUCTION,
  ADMIN_NOTIF_SERVER,
  ADMIN_NOTIF_STATS,
  type AdminNotifProductionMock,
} from './admin-notificaciones.mock';

@Component({
  selector: 'app-admin-notificaciones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-notificaciones.component.html',
})
export class AdminNotificacionesComponent {
  protected readonly stats = ADMIN_NOTIF_STATS;
  protected readonly production = ADMIN_NOTIF_PRODUCTION;
  protected readonly hr = ADMIN_NOTIF_HR;
  protected readonly inbox = ADMIN_NOTIF_INBOX;
  protected readonly server = ADMIN_NOTIF_SERVER;

  protected prodCardClass(n: AdminNotifProductionMock): string {
    const base =
      'rounded-lg bg-white p-5 transition-colors dark:bg-[var(--erp-login-card)] border-l-4 hover:bg-[#f3f4f5] dark:hover:bg-[var(--erp-login-input-bg)]';
    return n.severity === 'critical' ? `${base} border-[#fe4b55]` : `${base} border-[#47607e]`;
  }

  protected onProdAction(_id: string, _label: string): void {
    return;
  }

  protected onHrAction(_id: string, _label: string): void {
    return;
  }
}
