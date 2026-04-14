import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, Subscription, timer } from 'rxjs';
import { SystemParametersApiService } from '../../core/system-parameters/system-parameters-api.service';
import type { HolidayRowDto } from '../../core/system-parameters/system-parameters-api.types';
import { LeaveRequestsService } from '../../core/services/leave-requests.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { apiBaseUrl } from '../../core/environment';

export type WorkerPermisoHistoryStatus = 'propuesta_admin' | 'aprobado' | 'revision' | 'rechazado';
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
  readonly evidenceUrl: string | null;
  readonly segments: Array<{ start: string; end: string; count: number }>;
  readonly negotiation?: {
    readonly from: string;
    readonly message: string;
    readonly proposedStartDate?: string;
    readonly proposedEndDate?: string;
    readonly proposedSegments?: Array<{ start: string; end: string; count: number }>;
  };
}

@Component({
  selector: 'app-trabajador-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajador-permisos.component.html',
})
export class TrabajadorPermisosComponent implements OnInit, OnDestroy {
  private readonly sysParams = inject(SystemParametersApiService);
  private readonly leaveService = inject(LeaveRequestsService);
  private readonly fb = inject(FeedbackService);
  private pollingSub?: Subscription;

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
  protected readonly isUploading = signal(false);
  protected readonly previewUrl = signal<string | null>(null);

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

  protected readonly hasNoAvailableDays = computed(() => {
    const val = this.balance().availableDays;
    // Si el valor es 0, '0' o el guion inicial, se considera que no tiene días.
    return val === 0 || val === '0' || val === '—';
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
    // Limpiar notificación de inicio al entrar a esta vista
    this.leaveService.hasVacationUpdate.set(false);

    this.sysParams.get().subscribe({
      next: (snap) => {
        this.holidays.set(snap.holidays);
      },
      error: (err) => console.error('Error al cargar parámetros del sistema', err),
    });

    // Polling cada 10 segundos para actualizar balance e historial
    this.pollingSub = timer(0, 10000).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
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

      const approvedSum = reqs
        .filter(r => r.status === 'APPROVED')
        .reduce((acc, curr) => acc + curr.totalDays, 0);
      
      this.balance.update(b => ({ ...b, requested: requestedSum, approved: approvedSum }));

      const mapped = reqs.map((r) => {
        const lo = new Date(r.startDate).toLocaleDateString();
        const hi = new Date(r.endDate).toLocaleDateString();
        
        let status: WorkerPermisoHistoryStatus = 'revision';
        if (r.status === 'APPROVED') status = 'aprobado';
        else if (r.status === 'REJECTED') status = 'rechazado'; 
        else if (r.status === 'ADMIN_PROPOSAL') status = 'propuesta_admin';
        
        // Buscar el último mensaje de negociación o rechazo
        let negotiation = undefined;
        if ((r.status === 'ADMIN_PROPOSAL' || r.status === 'REJECTED') && r.history && r.history.length > 0) {
          const actionToFind = r.status === 'REJECTED' ? 'REJECTED' : 'ADMIN_PROPOSAL';
          const lastH = [...r.history].reverse().find(h => h.actionType === actionToFind);
          if (lastH) {
            negotiation = {
              from: lastH.author?.fullName || 'Administrador',
              message: lastH.message,
              proposedStartDate: lastH.proposedStartDate,
              proposedEndDate: lastH.proposedEndDate,
              proposedSegments: lastH.proposedSegments
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
          evidenceUrl: r.evidenceUrl,
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
      this.fb.showToast('Debes seleccionar al menos un día en el calendario.', 'warning');
      return;
    }

    if (this.requestNature() === 'ABSENCE' && !this.reason()) {
      this.fb.showToast('Debes proporcionar un motivo para el justificante.', 'warning');
      return;
    }

    this.showConfirmModal.set(true);
  }

  protected isImageFile(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  protected confirmSend(): void {
    if (this.isSending() || this.isUploading()) return;
    
    const segments = this.selectedSegments();
    if (segments.length === 0) return;

    this.isSending.set(true);
    
    // Si hay archivo, primero lo subimos
    const file = this.evidenceFile();
    if (file) {
      this.isUploading.set(true);
      this.leaveService.uploadEvidence(file).subscribe({
        next: (res) => {
          this.isUploading.set(false);
          this.submitFinalRequest(res.url, segments);
        },
        error: (err) => {
          this.isUploading.set(false);
          this.isSending.set(false);
          this.fb.showToast('Error al subir la evidencia. Intenta de nuevo.', 'error');
        }
      });
    } else {
      this.submitFinalRequest(null, segments);
    }
  }

  private submitFinalRequest(evidenceUrl: string | null, segments: any[]): void {
    const minDate = new Date(segments[0].start).toISOString().slice(0, 10);
    const maxDate = new Date(segments[segments.length - 1].end).toISOString().slice(0, 10);
    const totalCount = segments.reduce((acc: number, seg: any) => acc + seg.count, 0);
    
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
      evidenceUrl: evidenceUrl || '',
      segments: backendSegments
    };

    this.leaveService.createRequest(payload).subscribe({
      next: () => {
        this.isSending.set(false);
        this.showConfirmModal.set(false);
        this.fb.showToast('Solicitud enviada correctamente', 'success');
        this.clearSelection();
        this.reason.set('');
        this.evidenceFile.set(null);
        this.loadData();
      },
      error: (err) => {
        this.isSending.set(false);
        this.fb.showToast(err?.error?.message || 'Hubo un error al enviar la solicitud', 'error');
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
    
    // Validar tipo de archivo (PDF o Imagen)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.fb.showToast('Solo se permiten archivos en formato PDF o imagen (JPG, PNG, WEBP).', 'error');
      input.value = ''; 
      this.evidenceFile.set(null);
      return;
    }

    // Validar tamaño de archivo (máximo 30MB)
    const MAX_MB = 30;
    if (file.size > MAX_MB * 1024 * 1024) {
      this.fb.showToast(`El archivo excede el tamaño máximo permitido de ${MAX_MB}MB.`, 'error');
      input.value = ''; 
      this.evidenceFile.set(null);
      return;
    }

    this.evidenceFile.set(file);
  }

  protected openEvidence(url: string | null): void {
    if (!url) return;
    
    const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl.split('/api')[0]}${url.startsWith('/') ? '' : '/'}${url}`;
    
    // Determinar si es imagen por la extensión o si ya sabemos el tipo
    const isImage = fullUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);
    
    if (isImage) {
      this.previewUrl.set(fullUrl);
    } else {
      window.open(fullUrl, '_blank');
    }
  }


  protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
    this.fb.showConfirm(
      'Aceptar propuesta', 
      '¿Deseas aceptar las fechas propuestas por el administrador? Se actualizará tu solicitud.'
    ).then(confirmed => {
      if (confirmed) {
        this.leaveService.updateStatus(item.id, {
          status: 'APPROVED',
          message: 'Aceptado por el trabajador',
          proposedStartDate: item.negotiation!.proposedStartDate,
          proposedEndDate: item.negotiation!.proposedEndDate,
          proposedSegments: item.negotiation!.proposedSegments
        }).subscribe(() => {
          this.fb.showToast('Solicitud actualizada y aprobada', 'success');
          this.loadData();
        });
      }
    });
  }

  protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
    this.fb.showPrompt(
      'Rechazar propuesta',
      'Indica por qué rechazas la propuesta del administrador:',
      'Escribe el motivo del rechazo...'
    ).then(reason => {
      if (reason === null) return;
      
      this.leaveService.updateStatus(item.id, {
        status: 'PENDING',
        message: `El trabajador rechazó la propuesta: ${reason}`
      }).subscribe(() => {
        this.fb.showToast('Propuesta rechazada. El administrador revisará tu respuesta.', 'info');
        this.loadData();
      });
    });
  }

  protected statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
    if (status === 'propuesta_admin') {
      return 'erp-permisos-badge erp-permisos-badge--propuesta';
    }
    if (status === 'aprobado') {
      return 'erp-permisos-badge erp-permisos-badge--aprobado';
    }
    if (status === 'rechazado') {
      return 'erp-permisos-badge erp-permisos-badge--rechazado';
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
    if (status === 'rechazado') {
      return 'Rechazado';
    }
    return 'En revisión';
  }
}
