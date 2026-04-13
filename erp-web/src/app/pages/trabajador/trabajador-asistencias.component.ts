import { NgClass } from '@angular/common';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { AttendanceRecord, AttendanceService } from '../../core/http/attendance.service';

export type TrabajadorAsistenciaDiaEstado = 'punctual' | 'delay' | 'absence' | 'empty';

export interface TrabajadorAsistenciaCalDay {
  readonly d: number | null;
  readonly estado: TrabajadorAsistenciaDiaEstado;
}


@Component({
  selector: 'app-trabajador-asistencias',
  standalone: true,
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

  protected readonly selectedDate = signal<string | null>(null);

  protected prevMonth(): void {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() - 1);
    this.viewMonth.set(d);
    this.selectedDate.set(null);
  }

  protected nextMonth(): void {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() + 1);
    this.viewMonth.set(d);
    this.selectedDate.set(null);
  }

  protected pickDay(cell: TrabajadorAsistenciaCalDay): void {
    if (cell.d === null) return;
    const v = this.viewMonth();
    const iso = `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(cell.d).padStart(2, '0')}`;
    this.selectedDate.set(iso);
  }

  protected isDaySelected(cell: TrabajadorAsistenciaCalDay): boolean {
    if (cell.d === null || !this.selectedDate()) return false;
    const v = this.viewMonth();
    const iso = `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(cell.d).padStart(2, '0')}`;
    return this.selectedDate() === iso;
  }
}
