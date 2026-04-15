import { Component, OnInit, inject, signal } from '@angular/core';

import {
  ADMIN_ALERTS_MOCK,
  ADMIN_ATTENDANCE_CALENDAR_MOCK,
  ADMIN_KPIS_MOCK,
  ADMIN_SHIFT_PRODUCTION_MOCK,
  KPI_TONE_HEX,
  type AttendanceCalDayKind,
  type KpiTone,
  type AdminKpiMock,
} from './admin-dashboard.mock';
import { KpiMiniChartComponent } from '../../shared/kpi-mini-chart.component';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [KpiMiniChartComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected kpis = signal<AdminKpiMock[]>([]);
  protected readonly alerts = ADMIN_ALERTS_MOCK;
  protected readonly attendanceCalendar = ADMIN_ATTENDANCE_CALENDAR_MOCK;
  protected readonly shiftProduction = ADMIN_SHIFT_PRODUCTION_MOCK;

  ngOnInit(): void {
    this.loadKpis();
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
            tone: 'amber',
            chart: {
              kind: 'donut',
              donut: [
                { pct: 100, color: '#f59e0b' },
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
            label: 'Cierres pendientes',
            value: data.cierres.label,
            sub: 'Por aprobar',
            trend: 'down',
            tone: 'cyan',
            chart: {
              kind: 'area',
              values: [0, 0, 0, 0, 0, 0, Number(data.cierres.count)],
            },
          },
        ];
        this.kpis.set(updatedKpis);
      },
      error: (err) => {
        // Fallback or error handling can go here, for now we keep the structure but empty
        console.error('Error loading KPIs', err);
      }
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
        return 'pending_actions';
      default:
        return 'analytics';
    }
  }

  protected trendIcon(t: 'up' | 'down' | 'neutral'): string {
    if (t === 'up') {
      return 'trending_up';
    }
    if (t === 'down') {
      return 'trending_down';
    }
    return 'remove';
  }

  protected trendLabel(t: 'up' | 'down' | 'neutral'): string {
    if (t === 'up') {
      return 'Al alza';
    }
    if (t === 'down') {
      return 'A la baja';
    }
    return 'Estable';
  }

  protected trendClass(t: 'up' | 'down' | 'neutral'): string {
    const base = 'erp-trend';
    if (t === 'up') {
      return `${base} erp-trend--up`;
    }
    if (t === 'down') {
      return `${base} erp-trend--down`;
    }
    return `${base} erp-trend--neutral`;
  }

  protected calDayClass(kind: AttendanceCalDayKind): string {
    return `erp-cal-day erp-cal-day--${kind}`;
  }

  /** Mock: enlazar a informe / ruta cuando exista el módulo. */
  protected onExecutiveReport(): void {
    return;
  }
}
