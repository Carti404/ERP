import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import {
  TRABAJADOR_PRODUCCION_ACTIVITIES,
  TRABAJADOR_PRODUCCION_INSUMOS,
  TRABAJADOR_PRODUCCION_MAQUINARIA,
  TRABAJADOR_PRODUCCION_PEERS,
  TRABAJADOR_PRODUCCION_RECIPE,
  TRABAJADOR_PRODUCCION_TAKT_LABEL,
  TRABAJADOR_PRODUCCION_TAKT_NEEDLE_DEG,
  TRABAJADOR_PRODUCCION_TASK,
  type TrabajadorProduccionPeerMock,
} from './trabajador-produccion.mock';

@Component({
  selector: 'app-trabajador-produccion',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './trabajador-produccion.component.html',
})
export class TrabajadorProduccionComponent {
  protected readonly task = TRABAJADOR_PRODUCCION_TASK;
  protected readonly insumos = TRABAJADOR_PRODUCCION_INSUMOS;
  protected readonly maquinaria = TRABAJADOR_PRODUCCION_MAQUINARIA;
  protected readonly recipe = TRABAJADOR_PRODUCCION_RECIPE;
  protected readonly taktNeedleDeg = TRABAJADOR_PRODUCCION_TAKT_NEEDLE_DEG;
  protected readonly taktLabel = TRABAJADOR_PRODUCCION_TAKT_LABEL;
  protected readonly activities = TRABAJADOR_PRODUCCION_ACTIVITIES;
  protected readonly peers = TRABAJADOR_PRODUCCION_PEERS;

  /** Cantidad que el operario edita antes de confirmar (demo). */
  protected readonly reportQty = signal(this.task.reported);

  protected readonly reportPct = computed(() => {
    const t = this.task.target;
    if (t <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.reportQty() / t) * 1000) / 10);
  });

  protected adjustReport(delta: number): void {
    this.reportQty.update((q) => Math.max(0, Math.min(this.task.target, q + delta)));
  }

  protected segmentClass(kind: TrabajadorProduccionPeerMock['segments'][number]): string {
    const base = 'flex-1 rounded-sm';
    switch (kind) {
      case 'primary':
        return `${base} bg-[#051125] dark:bg-slate-200`;
      case 'secondary':
        return `${base} bg-[#47607e]`;
      case 'error':
        return `${base} bg-[#ba1a1a]`;
      default:
        return `${base} bg-[#e1e3e4] dark:bg-[var(--erp-login-input-border)]`;
    }
  }

  protected peerCardClass(p: TrabajadorProduccionPeerMock): string {
    const base = 'rounded-lg border-l-4 p-3';
    if (p.variant === 'alert') {
      return `${base} border-[#ba1a1a] bg-[#ffdad8]/35 dark:bg-[#55000c]/20`;
    }
    return `${base} border-[#47607e] bg-white dark:bg-[var(--erp-login-card)]`;
  }

  protected onConfirmReport(): void {
    return;
  }

  protected onInformarMerma(): void {
    return;
  }

  protected onDevolucion(): void {
    return;
  }

  protected onAprobarCierre(): void {
    return;
  }
}
