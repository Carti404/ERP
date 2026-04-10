import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceMatrixResponse } from '../../core/http/attendance.service';
import { MessagesApiService } from '../../core/messages/messages-api.service';
import { MessageImportance, MessageCategory } from '../../core/messages/messages-api.types';
import { finalize } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Re-defining internal types to avoid dependence on large mock file structures
export type AdminAsistenciaCellKind = 'punctual' | 'delay' | 'absence' | 'justification' | 'off';

export interface AdminAsistenciaCell {
  readonly kind: AdminAsistenciaCellKind;
  readonly time?: string;
  readonly realDate?: string;
}

export interface AdminAsistenciaSelection {
  readonly workerId: string;
  readonly date: string;
}

@Component({
  selector: 'app-admin-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './admin-asistencias.component.html',
})
export class AdminAsistenciasComponent {
  private readonly attendanceApi = inject(AttendanceService);
  private readonly messagesApi = inject(MessagesApiService);
  private readonly datePipe = inject(DatePipe);

  // Fecha de referencia para el calendario (por defecto hoy)
  protected readonly referenceDate = signal<Date>(new Date());

  // Rango de la semana actual
  private readonly weekRange = computed(() => {
    const ref = this.referenceDate();
    const start = new Date(ref);
    // Ajustar al lunes de la semana actual
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  });

  protected readonly weekLabel = computed(() => {
    const { start, end } = this.weekRange();
    const startStr = this.datePipe.transform(start, 'dd MMM');
    const endStr = this.datePipe.transform(end, 'dd MMM yyyy');
    return `${startStr} - ${endStr}`;
  });

  protected readonly dayHeaders = computed(() => {
    const { start } = this.weekRange();
    const headers = [];
    const dayNames = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      headers.push({
        key: dayNames[i],
        label: `${dayNames[i].toUpperCase()} ${d.getDate()}`,
        fullDate: d.toISOString().split('T')[0]
      });
    }
    return headers;
  });

  // Datos reales de la API
  protected readonly matrixResponse = signal<AttendanceMatrixResponse | null>(null);
  protected readonly isLoading = signal(false);

  protected readonly rows = computed(() => {
    const resp = this.matrixResponse();
    const headers = this.dayHeaders();
    if (!resp) return [];

    return resp.workers.map(w => {
      const workerCells = headers.map(h => {
        const record = resp.matrix[w.id]?.[h.fullDate];
        
        let kind: AdminAsistenciaCellKind = 'off';
        let time = '';

        if (record) {
          // Mapeo simple de status a colores semáforo
          if (record.status === 'Puntual') kind = 'punctual';
          else if (record.status === 'Retardo') kind = 'delay';
          else if (record.status === 'Falta') kind = 'absence';
          else kind = 'off';

          if (record.checkIn) {
            time = new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }

        return { kind, time, realDate: h.fullDate };
      });

      return {
        id: w.id,
        name: w.fullName,
        initials: w.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        cells: workerCells
      };
    });
  });

  protected incidenceNote = '';
  protected readonly isSendingIncidence = signal(false);

  protected readonly selection = signal<AdminAsistenciaSelection | null>(null);

  protected readonly panelDetail = computed(() => {
    const s = this.selection();
    const resp = this.matrixResponse();
    if (!s || !resp) return null;

    const worker = resp.workers.find(w => w.id === s.workerId);
    const record = resp.matrix[s.workerId]?.[s.date];
    
    if (!worker || !record) return null;

    return {
      workerId: worker.id,
      workerName: worker.fullName,
      dayLabel: this.datePipe.transform(s.date, 'fullDate'),
      checkIn: record.checkIn ? this.datePipe.transform(record.checkIn, 'HH:mm') : '—',
      checkOut: record.checkOut ? this.datePipe.transform(record.checkOut, 'HH:mm') : '—',
      status: record.status,
      kind: this.rows().find(r => r.id === s.workerId)?.cells.find(c => c.realDate === s.date)?.kind || 'off'
    };
  });

  constructor() {
    effect(() => {
      const { start, end } = this.weekRange();
      this.loadMatrix(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
    });
  }

  private loadMatrix(start: string, end: string) {
    this.isLoading.set(true);
    this.attendanceApi.getMatrixData(start, end).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => this.matrixResponse.set(data),
      error: () => this.matrixResponse.set(null)
    });
  }

  protected isIncidenceCell(kind: AdminAsistenciaCellKind): boolean {
    return kind === 'delay' || kind === 'absence';
  }

  protected onSendIncidenceMessage(workerId: string): void {
    const note = this.incidenceNote.trim();
    if (!note || !workerId) return;

    this.isSendingIncidence.set(true);
    this.messagesApi.create({
      recipientId: workerId,
      subject: 'Consulta de puntualidad / Asistencia',
      body: note,
      importance: MessageImportance.MEDIUM,
      category: MessageCategory.INCIDENCE
    }).pipe(
      finalize(() => this.isSendingIncidence.set(false))
    ).subscribe({
      next: () => {
        this.incidenceNote = '';
        // Alert o toast si se desea
      }
    });
  }

  protected isCellSelected(workerId: string, date: string): boolean {
    const s = this.selection();
    return s !== null && s.workerId === workerId && s.date === date;
  }

  protected onCellClick(workerId: string, date: string, cell: any): void {
    if (cell.kind === 'off' && !cell.time) return;
    this.selection.set({ workerId, date });
  }

  protected cellRingClass(workerId: string, date: string): boolean {
    return this.isCellSelected(workerId, date);
  }

  protected onPrevWeek(): void {
    const ref = new Date(this.referenceDate());
    ref.setDate(ref.getDate() - 7);
    this.referenceDate.set(ref);
  }

  protected onNextWeek(): void {
    const ref = new Date(this.referenceDate());
    ref.setDate(ref.getDate() + 7);
    this.referenceDate.set(ref);
  }

  protected onExportReport(): void {
    const resp = this.matrixResponse();
    if (!resp) return;

    const doc = new jsPDF();
    const title = `Reporte de Asistencias: ${this.weekLabel()}`;
    
    doc.setFontSize(18);
    doc.text('ERP - Mundo Terapeuta', 14, 20);
    doc.setFontSize(14);
    doc.text(title, 14, 30);

    const headers = [['Trabajador', ...this.dayHeaders().map(h => h.label)]];
    const data = this.rows().map(row => [
      row.name,
      ...row.cells.map(c => c.time || (c.kind === 'absence' ? 'Falta' : '-'))
    ]);

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [5, 17, 37] }, // #051125
      styles: { fontSize: 8 }
    });

    doc.save(`reporte-asistencias-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  protected dayHeaderClass(h: any): string {
    const base = 'min-w-[4.5rem] p-3 text-center text-[10px] font-bold uppercase';
    const weekend = h.key === 'sáb' || h.key === 'dom';
    return weekend
      ? `${base} text-red-800 dark:text-red-300`
      : `${base} text-[#45474d] dark:text-[var(--erp-login-muted)]`;
  }

  protected onJustificacionOficio(): void { }
}
