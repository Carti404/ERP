import { Component, computed, signal } from '@angular/core';

import {
  ADMIN_PERMISOS_GANTT_ROWS,
  ADMIN_PERMISOS_KPIS,
  ADMIN_PERMISOS_PANEL_BY_ROW_ID,
  ADMIN_PERMISOS_TIMELINE_MARKERS,
  type AdminPermisoBarVariant,
} from './admin-permisos.mock';

@Component({
  selector: 'app-admin-permisos',
  standalone: true,
  templateUrl: './admin-permisos.component.html',
})
export class AdminPermisosComponent {
  protected readonly kpis = ADMIN_PERMISOS_KPIS;

  protected readonly ganttRows = ADMIN_PERMISOS_GANTT_ROWS;

  protected readonly timelineMarkers = ADMIN_PERMISOS_TIMELINE_MARKERS;

  protected readonly selectedRowId = signal<string>('r2');

  protected readonly panelDetail = computed(() => {
    const id = this.selectedRowId();
    if (!id) return null;
    return (ADMIN_PERMISOS_PANEL_BY_ROW_ID as any)[id] ?? (ADMIN_PERMISOS_PANEL_BY_ROW_ID as any)['r2'];
  });

  protected readonly viewMode = signal<'gantt' | 'list'>('gantt');

  protected setViewMode(m: 'gantt' | 'list'): void {
    this.viewMode.set(m);
  }

  protected selectRow(rowId: string): void {
    this.selectedRowId.set(rowId);
  }

  protected onGanttRowKeydown(ev: KeyboardEvent, rowId: string): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.selectRow(rowId);
    }
  }

  protected barClass(v: AdminPermisoBarVariant): string {
    return `erp-permisos-admin-bar erp-permisos-admin-bar--${v} erp-permisos-admin-bar--interactive`;
  }

  protected onApprove(): void {
    return;
  }

  protected onProposeAlt(): void {
    return;
  }

  protected onReject(): void {
    return;
  }

  protected onBarKeydown(ev: KeyboardEvent, rowId: string): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      ev.stopPropagation();
      this.selectRow(rowId);
    }
  }
}
