import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import {
  ADMIN_PRODUCCION_ALERT,
  ADMIN_PRODUCCION_ASIGNACIONES,
  ADMIN_PRODUCCION_DELEGATION_OPS,
  ADMIN_PRODUCCION_DELEGATION_TARGET,
  ADMIN_PRODUCCION_INSUMOS,
  ADMIN_PRODUCCION_LOAD,
  ADMIN_PRODUCCION_MAQUINARIA,
  ADMIN_PRODUCCION_RECIPE,
  ADMIN_PRODUCCION_REQUIREMENTS,
  ADMIN_PRODUCCION_SUPERVISION,
  type AdminProduccionSegmentKind,
} from './admin-produccion.mock';

export type AdminProduccionTab = 'req' | 'asig' | 'sup';

@Component({
  selector: 'app-admin-produccion',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './admin-produccion.component.html',
})
export class AdminProduccionComponent {
  protected readonly load = ADMIN_PRODUCCION_LOAD;
  protected readonly alert = ADMIN_PRODUCCION_ALERT;
  protected readonly requirements = ADMIN_PRODUCCION_REQUIREMENTS;
  protected readonly insumos = ADMIN_PRODUCCION_INSUMOS;
  protected readonly maquinaria = ADMIN_PRODUCCION_MAQUINARIA;
  protected readonly recipe = ADMIN_PRODUCCION_RECIPE;
  protected readonly delegationOps = ADMIN_PRODUCCION_DELEGATION_OPS;
  protected readonly delegationTarget = ADMIN_PRODUCCION_DELEGATION_TARGET;
  protected readonly supervision = ADMIN_PRODUCCION_SUPERVISION;
  protected readonly asignaciones = ADMIN_PRODUCCION_ASIGNACIONES;

  protected readonly activeTab = signal<AdminProduccionTab>('req');

  private readonly delegationQty = signal<Record<string, number>>(
    Object.fromEntries(ADMIN_PRODUCCION_DELEGATION_OPS.map((o) => [o.id, o.defaultQty])),
  );

  protected readonly delegationTotal = computed(() => {
    const q = this.delegationQty();
    return this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) || 0), 0);
  });

  protected readonly delegationBalanced = computed(
    () => this.delegationTotal() === this.delegationTarget,
  );

  protected selectTab(tab: AdminProduccionTab): void {
    this.activeTab.set(tab);
  }

  protected tabClass(tab: AdminProduccionTab): string {
    const active = this.activeTab() === tab;
    return active
      ? 'border-b-2 border-[#47607e] pb-1 text-white'
      : 'text-[#47607e] transition-colors hover:text-white';
  }

  protected onDelegationInput(id: string, raw: string): void {
    const n = Math.max(0, Math.floor(Number(raw.replace(/,/g, '')) || 0));
    this.delegationQty.update((prev) => ({ ...prev, [id]: n }));
  }

  protected delegationInputValue(id: string): number {
    return this.delegationQty()[id] ?? 0;
  }

  protected segmentClass(kind: AdminProduccionSegmentKind): string {
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

  protected workerCardClass(variant: 'ok' | 'warn' | 'alert'): string {
    const base = 'rounded-lg border-l-4 p-4';
    if (variant === 'alert') {
      return `${base} border-[#ba1a1a] bg-[#ffdad8]/40 dark:bg-[#55000c]/25`;
    }
    return `${base} border-[#47607e] bg-white dark:bg-[var(--erp-login-card)]`;
  }

  protected pctClass(variant: 'ok' | 'warn' | 'alert'): string {
    if (variant === 'alert') {
      return 'text-xs font-bold text-[#ba1a1a]';
    }
    return 'text-xs font-bold text-[#47607e]';
  }

  protected onConfirmDelegation(): void {
    return;
  }

  protected onDevolucion(): void {
    return;
  }

  protected onAprobarCierre(): void {
    return;
  }
}
