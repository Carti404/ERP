import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';

import {
  TRABAJADOR_ASISTENCIAS_DAYS,
  TRABAJADOR_ASISTENCIAS_HISTORIAL,
  TRABAJADOR_ASISTENCIAS_JUST_TYPES,
  TRABAJADOR_ASISTENCIAS_MES_LABEL,
  TRABAJADOR_ASISTENCIAS_SHIFTS,
  TRABAJADOR_ASISTENCIAS_STATS,
  TRABAJADOR_ASISTENCIAS_WEEK_DAYS,
  type TrabajadorAsistenciaCalDay,
  type TrabajadorJustificacionHistorialMock,
} from './trabajador-asistencias.mock';

@Component({
  selector: 'app-trabajador-asistencias',
  standalone: true,
  imports: [NgClass],
  templateUrl: './trabajador-asistencias.component.html',
})
export class TrabajadorAsistenciasComponent {
  protected readonly mesLabel = TRABAJADOR_ASISTENCIAS_MES_LABEL;
  protected readonly weekDays = TRABAJADOR_ASISTENCIAS_WEEK_DAYS;
  protected readonly calendarDays = TRABAJADOR_ASISTENCIAS_DAYS;
  protected readonly stats = TRABAJADOR_ASISTENCIAS_STATS;
  protected readonly justTypes = TRABAJADOR_ASISTENCIAS_JUST_TYPES;
  protected readonly shifts = TRABAJADOR_ASISTENCIAS_SHIFTS;
  protected readonly historial = TRABAJADOR_ASISTENCIAS_HISTORIAL;

  protected readonly selectedDay = signal<number | null>(31);

  protected readonly justTypeId = signal<string>(this.justTypes[0].id);
  protected readonly shiftId = signal<string>(this.shifts[0].id);
  protected readonly reasonText = signal<string>('');

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

  protected statusBadgeClass(row: TrabajadorJustificacionHistorialMock): string {
    switch (row.status) {
      case 'pending':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
      case 'approved':
        return 'bg-[#c2dcff] text-[#48617e] dark:bg-[#1b263b] dark:text-[#c2dcff]';
      default:
        return 'bg-red-500/15 text-red-800 dark:text-red-300';
    }
  }

  protected statusLabel(row: TrabajadorJustificacionHistorialMock): string {
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
