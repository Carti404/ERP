import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SystemParametersApiService } from '../../core/system-parameters/system-parameters-api.service';
import type { HolidayRowDto } from '../../core/system-parameters/system-parameters-api.types';
import { LeaveRequestsService } from '../../core/services/leave-requests.service';

export type WorkerPermisoHistoryStatus = 'propuesta_admin' | 'aprobado' | 'revision';

export type LeaveRequestType = 'VACATION' | 'LATENESS' | 'ABSENCE' | 'PERSONAL' | 'MEDICAL';

export interface WorkerPermisoHistoryItem {
  readonly id: string;
  readonly title: string;
  readonly dateRange: string;
  readonly daysLabel: string;
  readonly status: WorkerPermisoHistoryStatus;
  readonly negotiation?: {
    readonly from: string;
    readonly message: string;
  };
}

@Component({
  selector: 'app-trabajador-permisos',
  standalone: true,
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

  protected readonly selectionStartMs = signal<number | null>(null);

  protected readonly selectionEndMs = signal<number | null>(null);

  protected readonly holidays = signal<HolidayRowDto[]>([]);

  protected readonly requestType = signal<LeaveRequestType>('VACATION');
  protected readonly reason = signal<string>('');
  protected readonly evidenceFile = signal<File | null>(null);

  protected readonly monthTitle = computed(() => {
    const d = this.viewDate();
    const raw = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  protected readonly selectionReady = computed(() => {
    const a = this.selectionStartMs();
    const b = this.selectionEndMs();
    return a !== null && b !== null;
  });

  protected readonly selectionHint = computed(() => {
    if (this.selectionReady()) {
      return '';
    }
    const s = this.selectionStartMs();
    if (s === null) {
      return 'Pulsa el primer día. Después el último del rango, o vuelve a pulsar el mismo día si solo necesitas uno.';
    }
    return 'Pulsa el último día del rango, o el mismo día otra vez para solicitar un solo día.';
  });

  protected readonly selectionSummary = computed(() => {
    if (!this.selectionReady() && this.requestType() === 'VACATION') {
      return '';
    }
    const s = this.selectionStartMs();
    if (s === null) return '';
    const e = this.selectionEndMs() ?? s;

    const lo = Math.min(s as number, e as number);
    const hi = Math.max(s as number, e as number);
    const a = new Date(lo);
    const b = new Date(hi);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const na = a.toLocaleDateString('es-MX', opts);
    const nb = b.toLocaleDateString('es-MX', opts);
    
    // Calcula días laborables (lun-sáb) entre `a` y `b`
    let workingDaysCount = 0;
    let currentDate = new Date(a);
    while (currentDate <= b) {
      if (currentDate.getDay() !== 0) { // No es Domingo
        workingDaysCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dayWord = workingDaysCount === 1 ? '1 día laborable' : `${workingDaysCount} días laborables`;
    return na === nb ? `${na} · ${dayWord}` : `${na} — ${nb} · ${dayWord}`;
  });


  protected readonly calendarCells = computed(() => {
    const d = this.viewDate();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const s = this.selectionStartMs();
    const e = this.selectionEndMs();
    let lo: number | null = null;
    let hi: number | null = null;
    if (s !== null && e !== null) {
      lo = Math.min(s, e);
      hi = Math.max(s, e);
    } else if (s !== null) {
      lo = s;
      hi = s;
    }

    const currentHolidays = this.holidays();
    // Solo comparar por fecha exacta YYYY-MM-DD para evitar marcas cruzadas entre años.
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

      let inRange = false;
      let isStart = false;
      let isEnd = false;
      if (lo !== null && hi !== null) {
        isStart = timeMs === lo;
        isEnd = timeMs === hi;
        if (lo < hi) {
          inRange = timeMs > lo && timeMs < hi;
        }
      }
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
      this.balance.set({
        availableDays: res.availableDays,
        periodLabel: `Ingreso: ${new Date(res.fechaIngreso).toLocaleDateString()}`,
        requested: 0, // Podrías sumar los PENDING
        approved: res.usedDays,
      });
    });

    this.leaveService.getMyRequests().subscribe((reqs) => {
      const mapped = reqs.map((r) => {
        const lo = new Date(r.startDate).toLocaleDateString();
        const hi = new Date(r.endDate).toLocaleDateString();
        
        let status: WorkerPermisoHistoryStatus = 'revision';
        if (r.status === 'APPROVED') status = 'aprobado';
        else if (r.status === 'ADMIN_PROPOSAL') status = 'propuesta_admin';
        
        return {
          id: r.id,
          title: r.type === 'VACATION' ? 'Vacaciones' : 'Justificante',
          dateRange: r.startDate === r.endDate ? lo : `${lo} - ${hi}`,
          daysLabel: `${r.totalDays} día(s)`,
          status,
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
    this.selectionStartMs.set(null);
    this.selectionEndMs.set(null);
  }

  protected onDayClick(day: number): void {
    const v = this.viewDate();
    const y = v.getFullYear();
    const m = v.getMonth();
    const t = new Date(y, m, day).getTime();

    // Si no es vacaciones, solo se permite elegir un día.
    if (this.requestType() !== 'VACATION') {
      this.selectionStartMs.set(t);
      this.selectionEndMs.set(null); // O set(t) si preferimos igualarlo, lo dejas null para que el compute lo entienda como mismo día
      return;
    }

    const s = this.selectionStartMs();
    const e = this.selectionEndMs();

    if (s !== null && e !== null) {
      this.selectionStartMs.set(t);
      this.selectionEndMs.set(null);
      return;
    }

    if (s === null) {
      this.selectionStartMs.set(t);
      this.selectionEndMs.set(null);
      return;
    }

    if (t === s) {
      this.selectionEndMs.set(t);
      return;
    }

    if (t < s) {
      this.selectionEndMs.set(s);
      this.selectionStartMs.set(t);
    } else {
      this.selectionEndMs.set(t);
    }
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
    if (!this.selectionStartMs()) {
      window.alert('Debes seleccionar al menos un día en el calendario.');
      return;
    }

    if (this.requestType() !== 'VACATION' && !this.reason()) {
      window.alert('Debes proporcionar un motivo para el justificante.');
      return;
    }

    if (window.confirm('¿Confirmas el envío de esta solicitud?')) {
      const s = this.selectionStartMs();
      const e = this.selectionEndMs() ?? s;
      
      const lo = new Date(Math.min(s!, e!)).toISOString().slice(0, 10);
      const hi = new Date(Math.max(s!, e!)).toISOString().slice(0, 10);

      this.leaveService.createRequest({
        type: this.requestType(),
        startDate: lo,
        endDate: hi,
        reason: this.reason(),
        evidenceUrl: this.evidenceFile()?.name // Mocked por ahora hasta tener S3
      }).subscribe({
        next: () => {
          window.alert('Solicitud enviada correctamente');
          this.clearSelection();
          this.reason.set('');
          this.evidenceFile.set(null);
          this.loadData();
        },
        error: (err) => {
          window.alert(err?.error?.message || 'Hubo un error al enviar la solicitud');
        }
      });
    }
  }

  protected setRequestType(type: LeaveRequestType): void {
    this.requestType.set(type);
    this.clearSelection(); // Limpiar el calendario al cambiar de tipo
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


  protected onAcceptProposal(_item: WorkerPermisoHistoryItem): void {
    return;
  }

  protected onRejectProposal(_item: WorkerPermisoHistoryItem): void {
    return;
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
