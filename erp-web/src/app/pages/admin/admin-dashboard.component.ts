import { Component, OnInit, inject, signal } from '@angular/core';

import {
  ADMIN_ATTENDANCE_CALENDAR_MOCK,
  ADMIN_KPIS_MOCK,
  KPI_TONE_HEX,
  type AttendanceCalDayKind,
  type AttendanceCalendarPanelMock,
  type KpiTone,
  type AdminKpiMock,
} from './admin-dashboard.mock';
import { KpiMiniChartComponent } from '../../shared/kpi-mini-chart.component';
import { DashboardService, AssignedOrder } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [KpiMiniChartComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  // Inicializamos con Mocks para que nunca se vea vacío
  protected kpis = signal<AdminKpiMock[]>(ADMIN_KPIS_MOCK);
  protected attendanceCalendar = signal<AttendanceCalendarPanelMock>(ADMIN_ATTENDANCE_CALENDAR_MOCK);
  

  protected assignedOrders = signal<AssignedOrder[]>([]);

  ngOnInit(): void {
    this.loadKpis();
    this.loadAttendanceSummary();
    this.loadAssignedOrders();
  }

  private loadAssignedOrders(): void {
    this.dashboardService.getAssignedOrders().subscribe({
      next: (orders) => this.assignedOrders.set(orders),
      error: (err) => console.error('Error loading assigned orders', err),
    });
  }

  private loadAttendanceSummary(): void {
    this.dashboardService.getAttendanceSummary().subscribe({
      next: (resp) => {
        // Actualizamos la señal del calendario con el título y días reales del backend
        this.attendanceCalendar.update(prev => ({
          ...prev,
          title: resp.title,
          days: resp.days.map((s) => ({
            d: s.isPadding ? '' : s.day.toString(),
            kind: s.kind,
            isPadding: s.isPadding
          })),
          critical: {
            title: 'Resumen de incidencia',
            body: 'Verde: 100% Asistencia | Naranja: 3+ Retardos | Rojo: 3+ Faltas. (Domingos omitidos)',
          }
        }));
      },
      error: (err) => console.error('Error loading attendance summary', err),
    });
  }

  private loadKpis(): void {
    this.dashboardService.getAdminKpis().subscribe({
      next: (data) => {
        const updatedKpis: AdminKpiMock[] = [
          {
            id: 'mermas',
            label: 'Mermas (semana)',
            value: data.mermas.label,
            sub: 'Informadas por personal',
            trend: 'neutral',
            tone: 'violet',
            chart: {
              kind: 'donut',
              donut: [
                { pct: 100, color: '#8b5cf6' },
                { pct: 0, color: 'rgb(148 163 184 / 0.35)' },
              ],
            },
          },
          {
            id: 'asist',
            label: 'Asistencia hoy',
            value: data.asistencia.label,
            sub: 'Promedio general',
            trend: 'up',
            tone: 'emerald',
            chart: {
              kind: 'donut',
              donut: [
                { pct: data.asistencia.percentage, color: '#10b981' },
                { pct: 100 - data.asistencia.percentage, color: 'rgb(148 163 184 / 0.35)' },
              ],
            },
          },
          {
            id: 'pend',
            label: 'Órdenes de producción sin asignar',
            value: data.cierres.label,
            sub: 'Delegación pendiente',
            trend: 'neutral',
            tone: 'cyan',
            chart: {
              kind: 'area',
              values: [0, 0, 0, 0, 0, 0, Number(data.cierres.count)],
            },
          },
        ];
        this.kpis.set(updatedKpis);
      },
      error: (err) => console.error('Error loading KPIs', err)
    });
  }

  protected toneHex(tone: KpiTone): string {
    return KPI_TONE_HEX[tone];
  }

  protected kpiIcon(id: string): string {
    switch (id) {
      case 'mermas':
        return 'report';
      case 'asist':
        return 'groups';
      case 'pend':
        return 'assignment_late';
      default:
        return 'analytics';
    }
  }



  protected calDayClass(kind: AttendanceCalDayKind): string {
    return `erp-cal-day erp-cal-day--${kind}`;
  }


}
