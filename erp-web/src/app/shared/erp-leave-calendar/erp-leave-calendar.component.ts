import { Component, computed, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HolidayRowDto } from '../../core/system-parameters/system-parameters-api.types';

@Component({
  selector: 'erp-leave-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-sm font-bold capitalize text-[var(--erp-login-text-primary)]">{{ monthTitle() }}</h3>
      <div class="flex gap-1">
        <button
          type="button"
          class="rounded-lg p-1.5 text-[var(--erp-login-muted)] hover:bg-[color-mix(in_srgb,var(--erp-login-muted)_10%,transparent)]"
          (click)="prevMonth()"
          aria-label="Mes anterior"
        >
          <span class="material-symbols-outlined text-xl" aria-hidden="true">chevron_left</span>
        </button>
        <button
          type="button"
          class="rounded-lg p-1.5 text-[var(--erp-login-muted)] hover:bg-[color-mix(in_srgb,var(--erp-login-muted)_10%,transparent)]"
          (click)="nextMonth()"
          aria-label="Mes siguiente"
        >
          <span class="material-symbols-outlined text-xl" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </div>

    @if (legend()) {
      <div class="mb-3 flex flex-wrap gap-3 text-[9px] font-bold uppercase tracking-widest text-[var(--erp-login-muted)]">
        <span class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-slate-400/60"></span> Solicitado
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-[#47607e]"></span> Propuesta
        </span>
      </div>
    }

    <div
      class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--erp-login-muted)]"
    >
      @for (w of weekdayLabels; track w) {
        <span class="py-1">{{ w }}</span>
      }
    </div>

    <div class="mt-1 grid grid-cols-7 gap-1" role="grid" [attr.aria-label]="'Calendario de ' + monthTitle()">
      @for (c of calendarCells(); track $index) {
        @if (c.label === null) {
          <span class="aspect-square"></span>
        } @else {
          <button
            type="button"
            class="erp-permisos-cal-cell erp-permisos-cal-cell--btn transition-colors"
            [class.erp-permisos-cal-cell--original]="c.isOriginal && !c.isProposal"
            [class.erp-permisos-cal-cell--selected]="c.isProposal"
            [class.erp-permisos-cal-cell--holiday]="c.isHoliday"
            [disabled]="readonly() && !c.isProposal"
            [attr.title]="c.isHoliday ? c.holidayTitle : null"
            [attr.aria-label]="cellAriaLabel(c)"
            (click)="onDayClick(c)"
          >
            {{ c.label }}
          </button>
        }
      }
    </div>
  `,
})
export class ErpLeaveCalendarComponent {
  readonly viewDate = model(new Date());
  readonly selectedDatesMs = model<Set<number>>(new Set());
  readonly originalDatesMs = input<Set<number>>(new Set());
  readonly holidays = input<HolidayRowDto[]>([]);
  readonly multiSelect = input(true);
  readonly readonly = input(false);
  readonly legend = input(true);

  protected readonly weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

  protected readonly monthTitle = computed(() => {
    const d = this.viewDate();
    const raw = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  protected readonly calendarCells = computed(() => {
    const d = this.viewDate();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const selected = this.selectedDatesMs();
    const original = this.originalDatesMs();
    const currentHolidays = this.holidays();

    const cells: Array<{
      label: number | null;
      timeMs: number | null;
      isOriginal: boolean;
      isProposal: boolean;
      isHoliday: boolean;
      holidayTitle?: string;
    }> = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({
        label: null,
        timeMs: null,
        isOriginal: false,
        isProposal: false,
        isHoliday: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(y, m, day);
      const timeMs = dateObj.getTime();
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const iso = `${y}-${mm}-${dd}`;
      const hInfo = currentHolidays.find((h) => h.date.slice(0, 10) === iso);

      cells.push({
        label: day,
        timeMs,
        isOriginal: original.has(timeMs),
        isProposal: selected.has(timeMs),
        isHoliday: !!hInfo,
        holidayTitle: hInfo?.title,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        label: null,
        timeMs: null,
        isOriginal: false,
        isProposal: false,
        isHoliday: false,
      });
    }

    return cells;
  });

  protected prevMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
  }

  protected nextMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
  }

  protected onDayClick(c: { label: number | null; timeMs: number | null; isOriginal: boolean }): void {
    if (c.label === null || c.timeMs === null || this.readonly()) return;

    const t = c.timeMs;
    this.selectedDatesMs.update((s) => {
      const next = new Set(s);
      if (next.has(t)) {
        next.delete(t);
      } else {
        if (!this.multiSelect()) {
          next.clear();
        }
        next.add(t);
      }
      return next;
    });
  }

  protected cellAriaLabel(c: {
    label: number | null;
    isOriginal: boolean;
    isProposal: boolean;
    isHoliday: boolean;
    holidayTitle?: string;
  }): string {
    if (c.label === null) return '';
    const parts: string[] = [`Día ${c.label}`];
    if (c.isHoliday) parts.push(`No laborable: ${c.holidayTitle}`);
    if (c.isOriginal) parts.push('fecha solicitada');
    if (c.isProposal) parts.push('en propuesta');
    return parts.join(', ');
  }
}
