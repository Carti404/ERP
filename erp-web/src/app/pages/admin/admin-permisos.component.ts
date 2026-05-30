import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { ADMIN_PERMISOS_TIMELINE_MARKERS, type AdminPermisoBarVariant, type AdminPermisoGanttRow } from './admin-permisos.mock';
import { LeaveRequestsService, LeaveRequest } from '../../core/services/leave-requests.service';
import { NotificationService } from '../../core/services/notification.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { MessagesApiService } from '../../core/messages/messages-api.service';
import { SystemParametersApiService } from '../../core/system-parameters/system-parameters-api.service';
import type { HolidayRowDto } from '../../core/system-parameters/system-parameters-api.types';
import { ErpLeaveCalendarComponent } from '../../shared/erp-leave-calendar/erp-leave-calendar.component';
import {
  countWorkingDaysBetween,
  formatSegmentsSummary,
  msSetToSegments,
  segmentsEqual,
  segmentsToDateMsSet,
  type LeaveSegmentDto,
} from '../../core/leave/leave-segments.util';

@Component({
  selector: 'app-admin-permisos',
  standalone: true,
  imports: [CommonModule, ErpLeaveCalendarComponent],
  templateUrl: './admin-permisos.component.html',
})
export class AdminPermisosComponent implements OnInit, OnDestroy {
  private readonly leaveService = inject(LeaveRequestsService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FeedbackService);
  private readonly messagesService = inject(MessagesApiService);
  private readonly sysParams = inject(SystemParametersApiService);
  private pollingSub?: Subscription;

  protected readonly holidays = signal<HolidayRowDto[]>([]);

  protected readonly kpis = signal([
    { id: 'ops', label: 'Total operarios (planta)', value: '0', sub: 'Cargando...', icon: 'group' },
    { id: 'pend', label: 'Pendientes', value: '0', sub: 'Acción requerida', icon: 'priority_high', tone: 'alert' },
  ]);
  protected readonly timelineMarkers = ADMIN_PERMISOS_TIMELINE_MARKERS;
  protected readonly ganttRows = signal<AdminPermisoGanttRow[]>([]);
  protected readonly requests = signal<LeaveRequest[]>([]);

  protected readonly selectedRowId = signal<string>('');
  protected readonly previewUrl = signal<string | null>(null);

  protected readonly panelDetail = computed(() => {
    const id = this.selectedRowId();
    if (!id) return null;
    const req = this.requests().find(r => r.id === id);
    if (!req) return null;
    
    // Convert current Request to PanelDetail format
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);

    const dowMap = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

    return {
      id: req.id,
      initials: req.user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'XX',
      name: req.user?.fullName || 'Desconocido',
      role: req.type,
      periodFrom: { day: start.getDate().toString(), dow: dowMap[start.getDay()] },
      periodTo: { day: end.getDate().toString(), dow: dowMap[end.getDay()] },
      fullPeriod: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      totalDays: req.totalDays,
      reason: req.reason,
      evidenceUrl: req.evidenceUrl,
      status: this.mapStatus(req.status),
      statusRaw: req.status,
      segments: req.segments && req.segments.length > 0 
        ? req.segments.map(s => ({ start: s.start, end: s.end, count: s.count }))
        : [{ start: req.startDate, end: req.endDate, count: req.totalDays }],
      type: this.mapType(req.type),
      typeRaw: req.type,
      timeline: (req.history || []).map(h => ({
        title: this.mapActionTitle(h.actionType),
        meta: h.message || 'Sin mensaje adicional',
        date: new Date(h.createdAt).toLocaleString(),
        by: h.author?.fullName || 'Sistema',
        dot: this.mapActionDot(h.actionType),
        proposal: h.proposedSegments?.length
          ? formatSegmentsSummary(h.proposedSegments)
          : h.proposedStartDate
            ? `${new Date(h.proposedStartDate).toLocaleDateString()} al ${new Date(h.proposedEndDate!).toLocaleDateString()}`
            : null,
      })),
      pendingAppeal: req.status === 'WORKER_APPEAL',
      lastWorkerAppeal: this.getLastHistoryProposal(req, 'WORKER_APPEAL'),
    };
  });

  private mapActionTitle(type: string): string {
    const map: any = {
      'CREATED': 'Solicitud Creada',
      'APPROVED': 'Solicitud Aprobada',
      'REJECTED': 'Solicitud Rechazada',
      'ADMIN_PROPOSAL': 'Nueva Propuesta de Admin',
      'WORKER_APPEAL': 'Apelación de Trabajador'
    };
    return map[type] || type;
  }

  private mapActionDot(type: string): string {
    if (type === 'REJECTED') return 'urgent';
    if (type === 'APPROVED') return 'secondary';
    return 'secondary';
  }

  private mapStatus(status: string): string {
    const map: any = {
      'PENDING': 'PENDIENTE',
      'APPROVED': 'APROBADO',
      'REJECTED': 'RECHAZADO',
      'ADMIN_PROPOSAL': 'PROPUESTA ADMIN',
      'WORKER_APPEAL': 'APELACIÓN TRABAJADOR',
    };
    return map[status] || status;
  }

  private getLastHistoryProposal(
    req: LeaveRequest,
    action: 'ADMIN_PROPOSAL' | 'WORKER_APPEAL',
  ): LeaveSegmentDto[] | null {
    const history = req.history ?? [];
    const last = [...history].reverse().find((h) => h.actionType === action);
    if (!last?.proposedSegments?.length) return null;
    return last.proposedSegments;
  }

  private mapType(type: string): string {
    const map: any = {
      'VACATION': 'VACACIONES',
      'ABSENCE': 'JUSTIFICANTE',
      'MEDICAL': 'MÉDICO',
      'PERSONAL': 'PERSONAL'
    };
    return map[type] || type;
  }

  ngOnInit() {
    this.sysParams.get().subscribe({
      next: (snap) => this.holidays.set(snap.holidays),
      error: (err) => console.error('Error al cargar festivos', err),
    });

    this.pollingSub = timer(0, 10000).subscribe(() => {
      this.loadData();
    });

    this.notificationService.markByCategoryAsRead('LEAVE_REQUEST').subscribe();
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  private loadData() {
    this.leaveService.getAdminStats().subscribe(stats => {
       this.kpis.update(current => {
         current[0].value = stats.totalActiveWorkers.toString();
         current[0].sub = 'Trabajadores activos';
         current[1].value = stats.pendingRequests.toString();
         current[1].sub = stats.pendingRequests === 1 ? '1 solicitud' : `${stats.pendingRequests} solicitudes`;
         return [...current];
       });
    });

    this.leaveService.getAllRequests().subscribe(reqs => {
      this.requests.set(reqs);

      // Simple mock gantt row calculation for demo purposes:
      // We will map each request as an individual row exactly
      const mapping = reqs.map((r, i) => {
        let variant: AdminPermisoBarVariant = 'vacaciones';
        if (r.status === 'PENDING' || r.status === 'ADMIN_PROPOSAL' || r.status === 'WORKER_APPEAL') variant = 'pendiente';
        else if (r.status === 'APPROVED') variant = 'aprobado';
        else if (r.status === 'REJECTED') variant = 'rechazado';
        else if (r.type === 'MEDICAL') variant = 'medico';
        else if (r.type === 'PERSONAL') variant = 'personal';

        const reqSegments = r.segments && r.segments.length > 0
          ? r.segments
          : [{ start: r.startDate, end: r.endDate, count: r.totalDays }];

        return {
          id: r.id,
          initials: r.user?.fullName?.substring(0, 2).toUpperCase() || '--',
          name: r.user?.fullName || 'Sin Nombre',
          area: 'Solicitud: ' + this.mapType(r.type),
          bars: reqSegments.map((seg, idx) => ({
            label: this.mapStatus(r.status),
            leftPct: Math.min((i * 10) + (idx * 12), 85),
            widthPct: Math.max(5, seg.count * 5),
            variant
          }))
        };
      });
      this.ganttRows.set(mapping);
    });
  }

  protected readonly showAltModal = signal(false);
  protected readonly altOriginalDatesMs = signal<Set<number>>(new Set());
  protected readonly altProposalDatesMs = signal<Set<number>>(new Set());
  protected readonly altCalendarViewDate = signal(new Date());
  protected readonly altOriginalSegments = signal<LeaveSegmentDto[]>([]);

  protected readonly altProposalSummary = computed(() => {
    const sorted = [...this.altProposalDatesMs()].sort((a, b) => a - b);
    const segs = msSetToSegments(sorted, countWorkingDaysBetween);
    return formatSegmentsSummary(segs);
  });


  protected selectRow(rowId: string): void {
    this.selectedRowId.set(rowId);
  }

  protected onGanttRowKeydown(ev: KeyboardEvent, rowId: string): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.selectRow(rowId);
    }
  }

  protected barClass(v: AdminPermisoBarVariant): string {
    return `erp-permisos-admin-bar erp-permisos-admin-bar--${v} erp-permisos-admin-bar--interactive`;
  }

  protected onApprove(): void {
    this.fb.showConfirm(
      'Aprobar solicitud',
      '¿Estás seguro de que deseas aprobar esta solicitud?'
    ).then(confirmed => {
      if (confirmed) {
        const id = this.selectedRowId();
        this.leaveService.updateStatus(id, { status: 'APPROVED', message: 'Aprobado por Administrador' }).subscribe(() => {
          this.fb.showToast('Solicitud aprobada correctamente', 'success');
          this.loadData();
        });
      }
    });
  }

  protected onProposeAlt(): void {
    const detail = this.panelDetail();
    if (!detail) return;

    const originals = detail.segments.map((s) => ({
      start: s.start,
      end: s.end,
      count: s.count,
    }));
    this.altOriginalSegments.set(originals);
    this.altOriginalDatesMs.set(segmentsToDateMsSet(originals));
    this.altProposalDatesMs.set(segmentsToDateMsSet(originals));
    this.altCalendarViewDate.set(new Date(originals[0].start + 'T12:00:00'));
    this.showAltModal.set(true);
  }

  protected cancelAltProposal(): void {
    this.showAltModal.set(false);
    this.altProposalDatesMs.set(new Set());
  }

  protected clearAltProposal(): void {
    this.altProposalDatesMs.set(new Set());
  }

  protected sendAltProposal(): void {
    const sorted = [...this.altProposalDatesMs()].sort((a, b) => a - b);
    if (sorted.length === 0) {
      this.fb.showToast('Selecciona al menos un día en el calendario para la propuesta.', 'warning');
      return;
    }

    const segments = msSetToSegments(sorted, countWorkingDaysBetween);
    if (segmentsEqual(segments, this.altOriginalSegments())) {
      this.fb.showToast(
        'La propuesta debe ser distinta a las fechas originales solicitadas por el trabajador.',
        'warning',
      );
      return;
    }

    const id = this.selectedRowId();
    this.leaveService
      .updateStatus(id, {
        status: 'ADMIN_PROPOSAL',
        message: 'El administrador ha sugerido una nueva distribución de fechas.',
        proposedSegments: segments,
      })
      .subscribe({
        next: () => {
          this.fb.showToast('Propuesta alternativa enviada. Se abrió una apelación.', 'success');
          this.showAltModal.set(false);
          this.loadData();
        },
        error: (err) => {
          this.fb.showToast(err?.error?.message || 'No se pudo enviar la propuesta.', 'error');
        },
      });
  }

  protected onAcceptWorkerAppeal(): void {
    const detail = this.panelDetail();
    if (!detail?.lastWorkerAppeal?.length) {
      this.fb.showToast('No hay apelación del trabajador para aceptar.', 'warning');
      return;
    }

    this.fb
      .showConfirm(
        'Aceptar apelación',
        '¿Aprobar las fechas propuestas por el trabajador en su última apelación?',
      )
      .then((confirmed) => {
        if (!confirmed) return;
        const id = this.selectedRowId();
        this.leaveService
          .updateStatus(id, {
            status: 'APPROVED',
            message: 'Aceptado por administrador (apelación del trabajador)',
            proposedSegments: detail.lastWorkerAppeal!,
          })
          .subscribe({
            next: () => {
              this.fb.showToast('Apelación aceptada y solicitud aprobada', 'success');
              this.loadData();
            },
            error: (err) => {
              this.fb.showToast(err?.error?.message || 'No se pudo aceptar la apelación.', 'error');
            },
          });
      });
  }

  protected onReject(): void {
    this.fb.showPrompt(
      'Rechazar solicitud',
      'Por favor, ingresa el motivo del rechazo. Este campo es obligatorio:',
      'Escribe el motivo aquí...'
    ).then(reason => {
      if (reason === null) return;
      
      if (reason.trim() === '') {
        this.fb.showToast('El motivo del rechazo es obligatorio. No se completó la acción.', 'error');
        return;
      }
      
      const id = this.selectedRowId();
      this.leaveService.updateStatus(id, { 
        status: 'REJECTED', 
        message: reason 
      }).subscribe(() => {
        this.fb.showToast('Solicitud rechazada', 'success');
        this.loadData();
      });
    });
  }

  protected onBarKeydown(ev: KeyboardEvent, rowId: string): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      ev.stopPropagation();
      this.selectRow(rowId);
    }
  }

  protected readonly formatSegmentsSummary = formatSegmentsSummary;

  protected isImageFile(url: string | null): boolean {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|png|gif|webp)$/i) !== null;
  }

  protected openEvidence(url: string | null): void {
    if (!url) return;

    const suggestedFilename = `evidencia_${this.selectedRowId()}`;
    this.messagesService.evidenceLink(url, 'inline', suggestedFilename).subscribe({
      next: (res) => {
        window.open(res.url, '_blank', 'noopener');
      },
      error: (err) => {
        console.error('Error al descargar evidencia:', err);
        this.fb.showToast('No se pudo abrir la evidencia mediante el servidor local.', 'error');
      }
    });
  }
}
