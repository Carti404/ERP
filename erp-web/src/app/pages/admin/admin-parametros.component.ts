import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { messageFromApiError } from '../../core/http/api-error.util';
import { SystemParametersApiService } from '../../core/system-parameters/system-parameters-api.service';
import type {
  SystemParametersSnapshot,
  UpdateHolidaysPayload,
  UpdateSchedulePayload,
} from '../../core/system-parameters/system-parameters-api.types';
import {
  ADMIN_PARAMETROS_INITIAL,
  type AdminParametrosHolidayRow,
} from './admin-parametros.mock';

type ParamState = {
  monFri: {
    entry: string;
    exit: string;
    tolerance: number;
  };
  saturday: {
    entry: string;
    exit: string;
    tolerance: number;
  };
  snackMin: number;
  lunchFrom: string;
  lunchDurationMin: number;
  holidays: AdminParametrosHolidayRow[];
};

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

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

function deepCloneState(s: ParamState): ParamState {
  return {
    monFri: { ...s.monFri },
    saturday: { ...s.saturday },
    snackMin: s.snackMin,
    lunchFrom: s.lunchFrom,
    lunchDurationMin: s.lunchDurationMin,
    holidays: s.holidays.map((h) => ({ ...h })),
  };
}

function normalizeHm(raw: string): string {
  const t = raw.trim();
  return t.length >= 5 ? t.slice(0, 5) : t;
}

/** Normaliza a YYYY-MM-DD (evita desfaces por ISO con zona). */
function normalizeHolidayDate(raw: string): string {
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return raw.trim().slice(0, 10);
}

function snapshotToState(s: SystemParametersSnapshot): ParamState {
  return {
    monFri: { ...s.monFri },
    saturday: { ...s.saturday },
    snackMin: s.snackMin,
    lunchFrom: normalizeHm(s.lunchFrom),
    lunchDurationMin: s.lunchDurationMin,
    holidays: s.holidays.map((h) => ({
      id: h.id,
      title: h.title,
      sub: h.sub,
      date: normalizeHolidayDate(h.date),
    })),
  };
}

@Component({
  selector: 'app-admin-parametros',
  standalone: true,
  templateUrl: './admin-parametros.component.html',
})
export class AdminParametrosComponent implements OnInit {
  private readonly api = inject(SystemParametersApiService);

  protected readonly state = signal<ParamState>(cloneInitial());
  private readonly serverSnapshot = signal<ParamState | null>(null);

  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  // Estados para sección de Jornada/Descansos
  protected readonly savingSchedule = signal(false);
  protected readonly saveScheduleError = signal<string | null>(null);

  // Estados para sección de Calendario/Festivos
  protected readonly savingHolidays = signal(false);
  protected readonly saveHolidaysError = signal<string | null>(null);

  protected readonly calCursor = signal<Date>(new Date());

  protected readonly addingHoliday = signal(false);
  protected readonly draftHolidayDate = signal('');
  protected readonly draftHolidayTitle = signal('');
  protected readonly draftHolidaySub = signal('');

  protected readonly calMonthLabel = computed(() => {
    const d = this.calCursor();
    return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
  });

  protected readonly sortedHolidays = computed(() =>
    [...this.state().holidays].sort((a, b) => a.date.localeCompare(b.date)),
  );

  /**
   * Mini calendario: resalta festivo si coincide la fecha exacta en el mes visible
   * o el mismo día/mes en cualquier año (p. ej. 2024-05-01 se marca cada 1 de mayo).
   */
  protected readonly calCells = computed(() => {
    const d = this.calCursor();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0).getDate();
    const startPad = (first.getDay() + 6) % 7;

    const holidays = this.state().holidays;
    const holidayExact = new Set(
      holidays.map((h) => normalizeHolidayDate(h.date)),
    );
    const holidayMonthDay = new Set(
      holidays.map((h) => normalizeHolidayDate(h.date).slice(5, 10)),
    );

    const cells: { label: string; tone: 'muted' | 'day' | 'holiday' }[] = [];
    const prevLast = new Date(y, m, 0).getDate();
    for (let i = 0; i < startPad; i++) {
      cells.push({
        label: String(prevLast - startPad + i + 1),
        tone: 'muted',
      });
    }
    for (let day = 1; day <= lastDay; day++) {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const iso = `${y}-${mm}-${dd}`;
      const mdKey = `${mm}-${dd}`;
      const isHoliday =
        holidayExact.has(iso) || holidayMonthDay.has(mdKey);
      cells.push({
        label: String(day),
        tone: isHoliday ? 'holiday' : 'day',
      });
    }
    let nextMuted = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ label: String(nextMuted++), tone: 'muted' });
    }
    return cells;
  });

  ngOnInit(): void {
    this.reloadFromServer();
  }

  protected reloadFromServer(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.get().subscribe({
      next: (snap) => {
        const st = snapshotToState(snap);
        this.state.set(st);
        this.serverSnapshot.set(deepCloneState(st));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loadError.set(
          messageFromApiError(err) ?? 'No se pudieron cargar los parámetros.',
        );
        this.loading.set(false);
      },
    });
  }

  protected patchMonFri(
    field: 'entry' | 'exit' | 'tolerance',
    raw: string,
  ): void {
    this.state.update((s) => {
      const monFri = { ...s.monFri };
      if (field === 'tolerance') {
        monFri.tolerance = Math.max(0, Math.floor(Number(raw) || 0));
      } else {
        monFri[field] = normalizeHm(raw);
      }
      return { ...s, monFri };
    });
  }

  protected patchSaturday(
    field: 'entry' | 'exit' | 'tolerance',
    raw: string,
  ): void {
    this.state.update((s) => {
      const saturday = { ...s.saturday };
      if (field === 'tolerance') {
        saturday.tolerance = Math.max(0, Math.floor(Number(raw) || 0));
      } else {
        saturday[field] = normalizeHm(raw);
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
    this.state.update((s) => ({ ...s, lunchFrom: normalizeHm(raw) }));
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
    this.draftHolidayDate.set('');
    this.draftHolidayTitle.set('');
    this.draftHolidaySub.set('');
    this.addingHoliday.set(true);
  }

  protected cancelAddHoliday(): void {
    this.addingHoliday.set(false);
  }

  protected confirmAddHoliday(): void {
    const date = this.draftHolidayDate().trim().slice(0, 10);
    const title = this.draftHolidayTitle().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) {
      return;
    }
    this.state.update((s) => ({
      ...s,
      holidays: [
        ...s.holidays,
        {
          id: globalThis.crypto?.randomUUID?.() ?? `h-${Date.now()}`,
          date: normalizeHolidayDate(date),
          title,
          sub: this.draftHolidaySub().trim(),
        },
      ],
    }));
    const [yy, mo] = date.split('-').map(Number);
    this.calCursor.set(new Date(yy, mo - 1, 1));
    this.addingHoliday.set(false);
  }

  protected onPrevMonth(): void {
    this.calCursor.update((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  protected onNextMonth(): void {
    this.calCursor.update((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  // --- Lógica de Guardado ---

  protected onDiscardSchedule(): void {
    const snap = this.serverSnapshot();
    if (!snap) return;
    this.saveScheduleError.set(null);
    this.state.update((s) => ({
      ...s,
      monFri: { ...snap.monFri },
      saturday: { ...snap.saturday },
      snackMin: snap.snackMin,
      lunchFrom: snap.lunchFrom,
      lunchDurationMin: snap.lunchDurationMin,
    }));
  }

  protected onSaveSchedule(): void {
    const s = this.state();
    const payload: UpdateSchedulePayload = {
      monFri: { ...s.monFri },
      saturday: { ...s.saturday },
      snackMin: s.snackMin,
      lunchFrom: normalizeHm(s.lunchFrom),
      lunchDurationMin: s.lunchDurationMin,
    };

    this.saveScheduleError.set(null);
    this.savingSchedule.set(true);
    this.api.putSchedule(payload).subscribe({
      next: (snap) => {
        const fullState = snapshotToState(snap);
        this.state.set(fullState);
        this.serverSnapshot.set(deepCloneState(fullState));
        this.savingSchedule.set(false);
      },
      error: (err: unknown) => {
        this.savingSchedule.set(false);
        this.saveScheduleError.set(
          messageFromApiError(err) ?? 'No se pudo guardar la jornada.',
        );
      },
    });
  }

  protected onDiscardHolidays(): void {
    const snap = this.serverSnapshot();
    if (!snap) return;
    this.saveHolidaysError.set(null);
    this.state.update((s) => ({
      ...s,
      holidays: snap.holidays.map((h) => ({ ...h })),
    }));
  }

  protected onSaveHolidays(): void {
    const s = this.state();
    const payload: UpdateHolidaysPayload = {
      holidays: s.holidays.map((h) => ({
        date: normalizeHolidayDate(h.date),
        title: h.title.trim(),
        sub: (h.sub ?? '').trim(),
      })),
    };

    this.saveHolidaysError.set(null);
    this.savingHolidays.set(true);
    this.api.putHolidays(payload).subscribe({
      next: (snap) => {
        const fullState = snapshotToState(snap);
        this.state.set(fullState);
        this.serverSnapshot.set(deepCloneState(fullState));
        this.savingHolidays.set(false);
      },
      error: (err: unknown) => {
        this.savingHolidays.set(false);
        this.saveHolidaysError.set(
          messageFromApiError(err) ?? 'No se pudieron guardar los festivos.',
        );
      },
    });
  }

  protected calCellClass(tone: 'muted' | 'day' | 'holiday'): string {
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
