import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { SystemParametersApiService } from '../../core/system-parameters/system-parameters-api.service';
import type { HolidayRowDto } from '../../core/system-parameters/system-parameters-api.types';
import { LeaveRequestsService } from '../../core/services/leave-requests.service';

export type WorkerPermisoHistoryStatus = 'propuesta_admin' | 'aprobado' | 'revision';
export type LeaveRequestNature = 'VACATION' | 'ABSENCE';
export type AbsenceSubtype = 'PROGRAMMED' | 'URGENT';

export type LeaveRequestType = 'VACATION' | 'LATENESS' | 'ABSENCE' | 'PERSONAL' | 'MEDICAL';

export interface WorkerPermisoHistoryItem {
  readonly id: string;
  readonly title: string;
  readonly dateRange: string;
  readonly daysLabel: string;
  readonly status: WorkerPermisoHistoryStatus;
  readonly periodLabel: string;
  readonly segments: Array<{ start: string; end: string; count: number }>;
  readonly negotiation?: {
    readonly from: string;
    readonly message: string;
    readonly proposedStartDate?: string;
    readonly proposedEndDate?: string;
  };
}

@Component({
  selector: 'app-trabajador-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajador-permisos.component.html',
})
export class TrabajadorPermisosComponent implements OnInit {
  private readonly sysParams = inject(SystemParametersApiService);
  private readonly leaveService = inject(LeaveRequestsService);

  protected readonly balance = signal({
    availableDays: '—' as string | number,
    periodLabel: 'Cargando...',
    requested: 0,
    approved: 0,
  });

  protected readonly history = signal<WorkerPermisoHistoryItem[]>([]);

  protected readonly viewDate = signal(new Date());

  protected readonly fullDay = signal(true);

  protected readonly selectedDatesMs = signal<Set<number>>(new Set());
  protected readonly showConfirmModal = signal(false);
  protected readonly isSending = signal(false);

  protected readonly holidays = signal<HolidayRowDto[]>([]);

  protected readonly requestNature = signal<LeaveRequestNature>('VACATION');
  protected readonly absenceSubtype = signal<AbsenceSubtype>('PROGRAMMED');
  protected readonly requestType = signal<LeaveRequestType>('VACATION');
  protected readonly reason = signal<string>('');
  protected readonly evidenceFile = signal<File | null>(null);

  protected readonly monthTitle = computed(() => {
    const d = this.viewDate();
    const raw = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  protected readonly selectionReady = computed(() => {
    return this.selectedDatesMs().size > 0;
  });

  protected readonly selectionHint = computed(() => {
    if (this.selectionReady()) return '';
    const nature = this.requestNature();
    return nature === 'VACATION' 
      ? 'Selecciona los días para tus vacaciones (pueden ser varios periodos).' 
      : 'Selecciona el día de tu inasistencia en el calendario.';
  });

  /** Agrupa las fechas seleccionadas en bloques continuos de días. */
  protected readonly selectedSegments = computed(() => {
    const sorted = [...this.selectedDatesMs()].sort((a, b) => a - b);
    if (sorted.length === 0) return [];
    
    const segments: Array<{ start: number; end: number; count: number }> = [];
    let currentStart = sorted[0];
    let currentEnd = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
      const dayMs = 24 * 60 * 60 * 1000;
      const diff = sorted[i] - currentEnd;
      const currEndDate = new Date(currentEnd);
      
      // Permitir salto de domingos (diferencia de 2 días si brinca de sábado a lunes, o 3 si de viernes a lunes y sábado es inactivo)
      const isContiguous = 
        diff <= dayMs + 1000 || 
        (currEndDate.getDay() === 6 && diff <= 2 * dayMs + 1000) || 
        (currEndDate.getDay() === 5 && diff <= 3 * dayMs + 1000);

      if (isContiguous) {
        currentEnd = sorted[i];
      } else {
        segments.push({ start: currentStart, end: currentEnd, count: this.countWorkingDays(currentStart, currentEnd) });
        currentStart = sorted[i];
        currentEnd = sorted[i];
      }
    }
    segments.push({ start: currentStart, end: currentEnd, count: this.countWorkingDays(currentStart, currentEnd) });
    return segments;
  });

  protected readonly selectionSummary = computed(() => {
    const segments = this.selectedSegments();
    if (segments.length === 0) return '';
    
    const totalDays = segments.reduce((sum, s) => sum + s.count, 0);
    const nature = this.requestNature();
    const prefix = nature === 'VACATION' ? 'Vacaciones:' : 'Justificante:';
    
    if (segments.length === 1) {
      const s = segments[0];
      const na = new Date(s.start).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      const nb = new Date(s.end).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      return `${prefix} ${na === nb ? na : na + ' al ' + nb} · ${totalDays} día(s)`;
    }
    
    return `${prefix} ${segments.length} periodo(s) · Total ${totalDays} día(s)`;
  });

  private countWorkingDays(startMs: number, endMs: number): number {
    let count = 0;
    const current = new Date(startMs);
    const end = new Date(endMs);
    while (current <= end) {
      if (current.getDay() !== 0) count++; // Excluye domingos
      current.setDate(current.getDate() + 1);
    }
    return count;
  }


  protected readonly calendarCells = computed(() => {
    const d = this.viewDate();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const selected = this.selectedDatesMs();
    
    const currentHolidays = this.holidays();
    const holidayExact = new Set(
      currentHolidays.map((h) => h.date.slice(0, 10)),
    );

    const cells: Array<{
      label: number | null;
      timeMs: number | null;
      inRange: boolean;
      isStart: boolean;
      isEnd: boolean;
      isHoliday: boolean;
      holidayTitle?: string;
    }> = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({
        label: null,
        timeMs: null,
        inRange: false,
        isStart: false,
        isEnd: false,
        isHoliday: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(y, m, day);
      const timeMs = dateObj.getTime();
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const iso = `${y}-${mm}-${dd}`;

      const hInfo = currentHolidays.find(h => h.date.slice(0, 10) === iso);
      const isHoliday = !!hInfo;

      const isStart = selected.has(timeMs);
      const isEnd = false; // No usamos rango visual
      const inRange = false;
      cells.push({
        label: day,
        timeMs,
        inRange,
        isStart,
        isEnd,
        isHoliday,
        holidayTitle: hInfo?.title,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        label: null,
        timeMs: null,
        inRange: false,
        isStart: false,
        isEnd: false,
        isHoliday: false,
      });
    }

    return cells;
  });

  protected readonly weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

  ngOnInit(): void {
    this.sysParams.get().subscribe({
      next: (snap) => {
        this.holidays.set(snap.holidays);
      },
      error: (err) => console.error('Error al cargar parámetros del sistema', err),
    });

    this.loadData();
  }

  private loadData(): void {
    this.leaveService.getBalance().subscribe((res) => {
      this.balance.update(b => ({
        ...b,
        availableDays: res.availableDays,
        periodLabel: `Ingreso: ${new Date(res.fechaIngreso).toLocaleDateString()}`,
        approved: res.usedDays
      }));
    });

    this.leaveService.getMyRequests().subscribe((reqs) => {
      // Calcular KPI de solicitados (PENDING o ADMIN_PROPOSAL)
      const requestedSum = reqs
        .filter(r => r.status === 'PENDING' || r.status === 'ADMIN_PROPOSAL')
        .reduce((acc, curr) => acc + curr.totalDays, 0);
      
      this.balance.update(b => ({ ...b, requested: requestedSum }));

      const mapped = reqs.map((r) => {
        const lo = new Date(r.startDate).toLocaleDateString();
        const hi = new Date(r.endDate).toLocaleDateString();
        
        let status: WorkerPermisoHistoryStatus = 'revision';
        if (r.status === 'APPROVED') status = 'aprobado';
        else if (r.status === 'REJECTED') status = 'revision'; 
        else if (r.status === 'ADMIN_PROPOSAL') status = 'propuesta_admin';
        
        // Buscar el último mensaje de negociación si hay propuesta del admin
        let negotiation = undefined;
        if (r.status === 'ADMIN_PROPOSAL' && r.history && r.history.length > 0) {
          const lastH = [...r.history].reverse().find(h => h.actionType === 'ADMIN_PROPOSAL');
          if (lastH) {
            negotiation = {
              from: lastH.author?.fullName || 'Administrador',
              message: lastH.message,
              proposedStartDate: lastH.proposedStartDate,
              proposedEndDate: lastH.proposedEndDate
            };
          }
        }

        return {
          id: r.id,
          title: r.type === 'VACATION' ? 'Vacaciones' : 'Justificante',
          dateRange: r.startDate === r.endDate ? lo : `${lo} - ${hi}`,
          daysLabel: `${r.totalDays} día(s)`,
          periodLabel: `${r.startDate} al ${r.endDate}`,
          segments: r.segments && r.segments.length > 0
            ? r.segments.map(s => ({ start: s.start, end: s.end, count: s.count }))
            : [{ start: r.startDate, end: r.endDate, count: r.totalDays }],
          status,
          negotiation
        };
      });
      this.history.set(mapped);
    });
  }

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

  protected toggleFullDay(): void {
    this.fullDay.update((v) => !v);
  }

  protected clearSelection(): void {
    this.selectedDatesMs.update(s => {
      s.clear();
      return new Set(s);
    });
  }

  protected onDayClick(day: number): void {
    const v = this.viewDate();
    const y = v.getFullYear();
    const m = v.getMonth();
    const t = new Date(y, m, day).getTime();

    this.selectedDatesMs.update(s => {
      if (s.has(t)) {
        s.delete(t);
      } else {
        // Si no es vacaciones, limpiamos el resto para permitir solo uno
        if (this.requestNature() !== 'VACATION') {
          s.clear();
        }
        s.add(t);
      }
      return new Set(s);
    });
  }


  protected cellAriaLabel(c: {
    label: number | null;
    isStart: boolean;
    isEnd: boolean;
    inRange: boolean;
    isHoliday: boolean;
    holidayTitle?: string;
  }): string {
    if (c.label === null) {
      return '';
    }
    const parts: string[] = [`Día ${c.label}`];
    if (c.isHoliday) {
      parts.push(`No laborable: ${c.holidayTitle}`);
    }
    if (c.isStart && c.isEnd) {
      parts.push('seleccionado');
    } else if (c.isStart) {
      parts.push('inicio del rango');
    } else if (c.isEnd) {
      parts.push('fin del rango');
    } else if (c.inRange) {
      parts.push('dentro del rango');
    }
    return parts.join(', ');
  }

  protected onSendRequest(): void {
    if (this.selectedDatesMs().size === 0) {
      window.alert('Debes seleccionar al menos un día en el calendario.');
      return;
    }

    if (this.requestNature() === 'ABSENCE' && !this.reason()) {
      window.alert('Debes proporcionar un motivo para el justificante.');
      return;
    }

    this.showConfirmModal.set(true);
  }

  protected confirmSend(): void {
    this.isSending.set(true);
    
    const segments = this.selectedSegments();
    if (segments.length === 0) return;

    const minDate = new Date(segments[0].start).toISOString().slice(0, 10);
    const maxDate = new Date(segments[segments.length - 1].end).toISOString().slice(0, 10);
    const totalCount = segments.reduce((acc, seg) => acc + seg.count, 0);
    
    // Alistamos los segmentos para el backend (convertir números MS a fechas string)
    const backendSegments = segments.map(seg => ({
      start: new Date(seg.start).toISOString().slice(0, 10),
      end: new Date(seg.end).toISOString().slice(0, 10),
      count: seg.count
    }));

    let finalReason = this.reason();
    if (this.requestNature() === 'ABSENCE') {
      const subtypeLabel = this.absenceSubtype() === 'PROGRAMMED' ? '[FALTA PROGRAMADA]' : '[MOTIVO URGENTE]';
      finalReason = `${subtypeLabel} ${finalReason}`;
    }

    const payload = {
      type: this.requestNature() === 'VACATION' ? 'VACATION' : 'ABSENCE' as 'VACATION' | 'ABSENCE',
      startDate: minDate,
      endDate: maxDate,
      totalDays: totalCount,
      reason: finalReason || (this.requestNature() === 'VACATION' ? 'Vacaciones solicitadas' : 'Justificante de falta'),
      evidenceUrl: this.evidenceFile()?.name || '',
      segments: backendSegments
    };

    this.leaveService.createRequest(payload).subscribe({
      next: () => {
        this.isSending.set(false);
        this.showConfirmModal.set(false);
        window.alert('Solicitud enviada correctamente');
        this.clearSelection();
        this.reason.set('');
        this.evidenceFile.set(null);
        this.loadData();
      },
      error: (err) => {
        this.isSending.set(false);
        window.alert(err?.error?.message || 'Hubo un error al enviar la solicitud');
      }
    });
  }

  protected setRequestNature(nature: LeaveRequestNature): void {
    this.requestNature.set(nature);
    this.clearSelection(); 
  }

  protected updateReason(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.reason.set(target.value);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.evidenceFile.set(null);
      return;
    }
    
    const file = input.files[0];
    
    // Validar tipo de archivo (solo PDF)
    if (file.type !== 'application/pdf') {
      window.alert('Solo se permiten archivos en formato PDF.');
      input.value = ''; // clean up
      this.evidenceFile.set(null);
      return;
    }

    // Validar tamaño de archivo (máximo 30MB)
    const MAX_MB = 30;
    if (file.size > MAX_MB * 1024 * 1024) {
      window.alert(`El archivo excede el tamaño máximo permitido de ${MAX_MB}MB.`);
      input.value = ''; // clean up
      this.evidenceFile.set(null);
      return;
    }

    this.evidenceFile.set(file);
  }


  protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
    if (!item.negotiation?.proposedStartDate) return;
    
    if (confirm('¿Deseas aceptar las fechas propuestas por el administrador? Se actualizará tu solicitud.')) {
      this.leaveService.updateStatus(item.id, {
        status: 'APPROVED',
        message: 'Aceptado por el trabajador',
        proposedStartDate: item.negotiation.proposedStartDate,
        proposedEndDate: item.negotiation.proposedEndDate
      }).subscribe(() => {
        alert('Solicitud actualizada y aprobada');
        this.loadData();
      });
    }
  }

  protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
    const reason = prompt('Indica por qué rechazas la propuesta del administrador:');
    if (reason === null) return;
    
    this.leaveService.updateStatus(item.id, {
      status: 'PENDING',
      message: `El trabajador rechazó la propuesta: ${reason}`
    }).subscribe(() => {
      alert('Propuesta rechazada. El administrador revisará tu respuesta.');
      this.loadData();
    });
  }

  protected statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
    if (status === 'propuesta_admin') {
      return 'erp-permisos-badge erp-permisos-badge--propuesta';
    }
    if (status === 'aprobado') {
      return 'erp-permisos-badge erp-permisos-badge--aprobado';
    }
    return 'erp-permisos-badge erp-permisos-badge--revision';
  }

  protected statusLabel(status: WorkerPermisoHistoryStatus): string {
    if (status === 'propuesta_admin') {
      return 'Propuesta admin';
    }
    if (status === 'aprobado') {
      return 'Aprobado';
    }
    return 'En revisión';
  }
}
