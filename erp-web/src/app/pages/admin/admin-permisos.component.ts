import { Component, computed, inject, OnInit, signal } from '@angular/core';

import {
  ADMIN_PERMISOS_GANTT_ROWS,
  ADMIN_PERMISOS_KPIS,
  ADMIN_PERMISOS_PANEL_BY_ROW_ID,
  ADMIN_PERMISOS_TIMELINE_MARKERS,
  type AdminPermisoBarVariant,
  type AdminPermisoGanttRow,
} from './admin-permisos.mock';

import { LeaveRequestsService, LeaveRequest } from '../../core/services/leave-requests.service';

@Component({
  selector: 'app-admin-permisos',
  standalone: true,
  templateUrl: './admin-permisos.component.html',
})
export class AdminPermisosComponent implements OnInit {
  private readonly leaveService = inject(LeaveRequestsService);

  protected readonly kpis = signal(ADMIN_PERMISOS_KPIS);
  protected readonly timelineMarkers = ADMIN_PERMISOS_TIMELINE_MARKERS;
  protected readonly ganttRows = signal<AdminPermisoGanttRow[]>([]);
  protected readonly requests = signal<LeaveRequest[]>([]);

  protected readonly selectedRowId = signal<string>('');

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
      initials: req.user?.fullName?.substring(0, 2).toUpperCase() || 'XX',
      name: req.user?.fullName || 'Desconocido',
      role: req.type,
      periodFrom: { day: start.getDate().toString(), dow: dowMap[start.getDay()] },
      periodTo: { day: end.getDate().toString(), dow: dowMap[end.getDay()] },
      reason: req.reason,
      evidenceUrl: req.evidenceUrl,
      status: req.status,
      timeline: [
        { title: 'Solicitud Creada', meta: req.status, dot: req.status === 'PENDING' ? 'urgent' : 'secondary' }
      ]
    };
  });

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.leaveService.getAllRequests().subscribe(reqs => {
      this.requests.set(reqs);

      // Calcular KPIs
      const pendingCount = reqs.filter(r => r.status === 'PENDING').length;
      
      this.kpis.set([
        {
          id: 'ops',
          label: 'Total operarios (con solicitudes)',
          value: new Set(reqs.map(r => r.user?.id)).size.toString(),
          sub: 'Actualizado',
          icon: 'group',
        },
        {
          id: 'pend',
          label: 'Pendientes',
          value: pendingCount.toString(),
          sub: 'Acción requerida',
          icon: 'priority_high',
          tone: 'alert',
        },
      ]);

      // Simple mock gantt row calculation for demo purposes:
      // We will map each request as an individual row exactly
      const mapping = reqs.map((r, i) => {
        let variant: AdminPermisoBarVariant = 'vacaciones';
        if (r.status === 'PENDING') variant = 'pendiente';
        else if (r.type === 'MEDICAL') variant = 'medico';
        else if (r.type === 'PERSONAL') variant = 'personal';

        return {
          id: r.id,
          initials: r.user?.fullName?.substring(0, 2).toUpperCase() || '--',
          name: r.user?.fullName || 'Sin Nombre',
          area: 'Solicitud: ' + r.type,
          bars: [{ label: r.status, leftPct: Math.min((i * 10), 80), widthPct: Math.max(10, r.totalDays * 5), variant }]
        };
      });
      this.ganttRows.set(mapping);
      
      if(mapping.length > 0 && !this.selectedRowId()) {
         this.selectedRowId.set(mapping[0].id);
      }
    });
  }

  // Modal para proponer alternativa
  protected readonly showAltModal = signal<boolean>(false);
  protected readonly altStartDate = signal<string>('');
  protected readonly altEndDate = signal<string>('');


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
    if (window.confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
      const id = this.selectedRowId();
      this.leaveService.updateStatus(id, { status: 'APPROVED', message: 'Aprobado por Administrador' }).subscribe(() => {
        window.alert('Solicitud aprobada correctamente');
        this.loadData();
      });
    }
  }

  protected onProposeAlt(): void {
    this.showAltModal.set(true);
    this.altStartDate.set('');
    this.altEndDate.set('');
  }

  protected cancelAltProposal(): void {
    this.showAltModal.set(false);
  }

  protected sendAltProposal(): void {
    if (!this.altStartDate() || !this.altEndDate()) {
      window.alert('Debes seleccionar las fechas de inicio y fin para la propuesta.');
      return;
    }
    const id = this.selectedRowId();
    this.leaveService.updateStatus(id, { 
      status: 'ADMIN_PROPOSAL', 
      message: 'El administrador ha sugerido unas nuevas fechas.',
      proposedStartDate: this.altStartDate(),
      proposedEndDate: this.altEndDate()
    }).subscribe(() => {
      window.alert('Propuesta alternativa enviada');
      this.showAltModal.set(false);
      this.loadData();
    });
  }

  protected onReject(): void {
    const reason = window.prompt('Por favor, ingresa el motivo del rechazo. Este campo es obligatorio:');
    if (reason === null) return;
    
    if (reason.trim() === '') {
      window.alert('El motivo del rechazo es obligatorio. No se completó la acción.');
      return;
    }
    
    const id = this.selectedRowId();
    this.leaveService.updateStatus(id, { 
      status: 'REJECTED', 
      message: reason 
    }).subscribe(() => {
      window.alert('Solicitud rechazada');
      this.loadData();
    });
  }

  protected onBarKeydown(ev: KeyboardEvent, rowId: string): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      ev.stopPropagation();
      this.selectRow(rowId);
    }
  }
}
