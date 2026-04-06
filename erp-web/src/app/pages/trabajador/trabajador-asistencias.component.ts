import { NgClass } from '@angular/common';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { AttendanceRecord, AttendanceService } from '../../core/http/attendance.service';

export type TrabajadorAsistenciaDiaEstado = 'punctual' | 'delay' | 'absence' | 'empty';

export interface TrabajadorAsistenciaCalDay {
  readonly d: number | null;
  readonly estado: TrabajadorAsistenciaDiaEstado;
}

export interface TrabajadorJustificacionHistorialRow {
  readonly id: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly type: string;
  readonly date: string;
  readonly description: string;
}

const JUST_TYPES = [
  { id: 'med', label: 'Baja médica' },
  { id: 'delay', label: 'Justificación de retraso' },
  { id: 'abs', label: 'Ausencia' },
  { id: 'pers', label: 'Asunto personal' },
] as const;

const SHIFTS = [
  { id: 'morning', label: 'Mañana' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'night', label: 'Noche' },
] as const;

@Component({
  selector: 'app-trabajador-asistencias',
  standalone: true,
  imports: [NgClass],
  templateUrl: './trabajador-asistencias.component.html',
})
export class TrabajadorAsistenciasComponent {
  private readonly attendanceService = inject(AttendanceService);
  protected readonly attendanceHistory = signal<AttendanceRecord[]>([]);

  protected readonly viewMonth = signal(new Date());

  constructor() {
    afterNextRender(() => {
      this.loadHistory();
    });
  }

  private loadHistory(): void {
    this.attendanceService.getMyHistory().subscribe({
      next: (records) => {
        this.attendanceHistory.set(records);
      },
      error: (err) => console.error('Error al cargar historial', err),
    });
  }

  protected readonly mesLabel = computed(() => {
    const d = this.viewMonth();
    const raw = d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  protected readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

  protected readonly calendarDays = computed((): TrabajadorAsistenciaCalDay[] => {
    const d = this.viewMonth();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: TrabajadorAsistenciaCalDay[] = [];
    const history = this.attendanceHistory();

    const recordMap = new Map<string, string>();
    for (const r of history) {
      if (r.workDate) {
        recordMap.set(r.workDate, r.status);
      }
    }

    for (let i = 0; i < startPad; i++) {
      cells.push({ d: null, estado: 'empty' });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = recordMap.get(dateStr);
      let estado: TrabajadorAsistenciaDiaEstado = 'empty';
      
      if (status === 'Puntual') estado = 'punctual';
      else if (status === 'Retardo') estado = 'delay';
      else if (status === 'Falta') estado = 'absence';
      
      cells.push({ d: day, estado });
    }
    return cells;
  });

  protected readonly stats = computed(() => {
    const history = this.attendanceHistory();
    return {
      punctual: history.filter(r => r.status === 'Puntual').length,
      delays: history.filter(r => r.status === 'Retardo').length,
      absences: history.filter(r => r.status === 'Falta').length,
    };
  });

  protected readonly justTypes = JUST_TYPES;

  protected readonly shifts = SHIFTS;

  protected readonly historial: readonly TrabajadorJustificacionHistorialRow[] = [];

  protected readonly selectedDay = signal<number | null>(null);

  protected readonly justTypeId = signal<string>(JUST_TYPES[0].id);

  protected readonly shiftId = signal<string>(SHIFTS[0].id);

  protected readonly reasonText = signal<string>('');

  protected prevMonth(): void {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() - 1);
    this.viewMonth.set(d);
    this.selectedDay.set(null);
  }

  protected nextMonth(): void {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() + 1);
    this.viewMonth.set(d);
    this.selectedDay.set(null);
  }

  protected pickDay(cell: TrabajadorAsistenciaCalDay): void {
    if (cell.d === null) {
      return;
    }
    this.selectedDay.set(cell.d);
  }

  protected isDaySelected(cell: TrabajadorAsistenciaCalDay): boolean {
    return cell.d !== null && this.selectedDay() === cell.d;
  }

  protected onJustTypeChange(value: string): void {
    this.justTypeId.set(value);
  }

  protected onShiftChange(value: string): void {
    this.shiftId.set(value);
  }

  protected onReasonInput(value: string): void {
    this.reasonText.set(value);
  }

  protected onCancelForm(): void {
    this.reasonText.set('');
  }

  protected onSubmitForm(): void {
    return;
  }

  protected onUploadClick(): void {
    return;
  }

  protected statusBadgeClass(row: TrabajadorJustificacionHistorialRow): string {
    switch (row.status) {
      case 'pending':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
      case 'approved':
        return 'bg-[#c2dcff] text-[#48617e] dark:bg-[#1b263b] dark:text-[#c2dcff]';
      default:
        return 'bg-red-500/15 text-red-800 dark:text-red-300';
    }
  }

  protected statusLabel(row: TrabajadorJustificacionHistorialRow): string {
    switch (row.status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      default:
        return 'Rechazada';
    }
  }
}
