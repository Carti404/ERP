import { Component, signal } from '@angular/core';

import {
  ADMIN_PARAMETROS_CAL_CELLS,
  ADMIN_PARAMETROS_CAL_MONTH,
  ADMIN_PARAMETROS_INITIAL,
  type AdminParametrosHolidayMock,
} from './admin-parametros.mock';

type ParamState = {
  monFri: { entry: string; exit: string; tolerance: number; active: boolean };
  saturday: { entry: string; exit: string; tolerance: number; active: boolean };
  snackMin: number;
  lunchFrom: string;
  lunchDurationMin: number;
  holidays: AdminParametrosHolidayMock[];
};

function cloneInitial(): ParamState {
  const i = ADMIN_PARAMETROS_INITIAL;
  return {
    monFri: { ...i.monFri },
    saturday: { ...i.saturday },
    snackMin: i.snackMin,
    lunchFrom: i.lunchFrom,
    lunchDurationMin: i.lunchDurationMin,
    holidays: i.holidays.map((h) => ({ ...h })),
  };
}

@Component({
  selector: 'app-admin-parametros',
  standalone: true,
  templateUrl: './admin-parametros.component.html',
})
export class AdminParametrosComponent {
  protected readonly calMonth = ADMIN_PARAMETROS_CAL_MONTH;
  protected readonly calCells = ADMIN_PARAMETROS_CAL_CELLS;

  protected readonly state = signal<ParamState>(cloneInitial());

  protected setMonFriActive(v: boolean): void {
    this.state.update((s) => ({
      ...s,
      monFri: { ...s.monFri, active: v },
    }));
  }

  protected setSaturdayActive(v: boolean): void {
    this.state.update((s) => ({
      ...s,
      saturday: { ...s.saturday, active: v },
    }));
  }

  protected patchMonFri(field: 'entry' | 'exit' | 'tolerance', raw: string): void {
    this.state.update((s) => {
      const monFri = { ...s.monFri };
      if (field === 'tolerance') {
        monFri.tolerance = Math.max(0, Math.floor(Number(raw) || 0));
      } else {
        monFri[field] = raw;
      }
      return { ...s, monFri };
    });
  }

  protected patchSaturday(field: 'entry' | 'exit' | 'tolerance', raw: string): void {
    this.state.update((s) => {
      const saturday = { ...s.saturday };
      if (field === 'tolerance') {
        saturday.tolerance = Math.max(0, Math.floor(Number(raw) || 0));
      } else {
        saturday[field] = raw;
      }
      return { ...s, saturday };
    });
  }

  protected patchSnack(raw: string): void {
    this.state.update((s) => ({
      ...s,
      snackMin: Math.max(0, Math.floor(Number(raw) || 0)),
    }));
  }

  protected patchLunchFrom(raw: string): void {
    this.state.update((s) => ({ ...s, lunchFrom: raw }));
  }

  protected patchLunchDur(raw: string): void {
    this.state.update((s) => ({
      ...s,
      lunchDurationMin: Math.max(0, Math.floor(Number(raw) || 0)),
    }));
  }

  protected removeHoliday(id: string): void {
    this.state.update((s) => ({
      ...s,
      holidays: s.holidays.filter((h) => h.id !== id),
    }));
  }

  protected onAddHoliday(): void {
    return;
  }

  protected onPrevMonth(): void {
    return;
  }

  protected onNextMonth(): void {
    return;
  }

  protected onDiscard(): void {
    this.state.set(cloneInitial());
  }

  protected onSave(): void {
    return;
  }

  protected calCellClass(tone: (typeof ADMIN_PARAMETROS_CAL_CELLS)[number]['tone']): string {
    const base = 'flex h-6 items-center justify-center rounded-sm text-[10px]';
    if (tone === 'muted') {
      return `${base} text-[#75777d] dark:text-[var(--erp-login-muted)]`;
    }
    if (tone === 'holiday') {
      return `${base} bg-[#ffdad8] font-bold text-[#92001c] dark:bg-[#55000c]/40 dark:text-[#fe4b55]`;
    }
    return `${base} font-medium text-[#191c1d] dark:text-[var(--erp-login-text-primary)]`;
  }
}
