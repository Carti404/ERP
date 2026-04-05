import { Component } from '@angular/core';

import {
  ADMIN_ALERTS_MOCK,
  ADMIN_ATTENDANCE_CALENDAR_MOCK,
  ADMIN_KPIS_MOCK,
  ADMIN_SHIFT_PRODUCTION_MOCK,
  KPI_TONE_HEX,
  type AttendanceCalDayKind,
  type KpiTone,
} from './admin-dashboard.mock';
import { KpiMiniChartComponent } from '../../shared/kpi-mini-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [KpiMiniChartComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  protected readonly kpis = ADMIN_KPIS_MOCK;
  protected readonly alerts = ADMIN_ALERTS_MOCK;
  protected readonly attendanceCalendar = ADMIN_ATTENDANCE_CALENDAR_MOCK;
  protected readonly shiftProduction = ADMIN_SHIFT_PRODUCTION_MOCK;

  protected toneHex(tone: KpiTone): string {
    return KPI_TONE_HEX[tone];
  }

  protected kpiIcon(id: string): string {
    switch (id) {
      case 'prod':
        return 'precision_manufacturing';
      case 'mermas':
        return 'scale';
      case 'asist':
        return 'groups';
      case 'pend':
        return 'pending_actions';
      default:
        return 'analytics';
    }
  }

  protected trendIcon(t: (typeof ADMIN_KPIS_MOCK)[number]['trend']): string {
    if (t === 'up') {
      return 'trending_up';
    }
    if (t === 'down') {
      return 'trending_down';
    }
    return 'remove';
  }

  protected trendLabel(t: (typeof ADMIN_KPIS_MOCK)[number]['trend']): string {
    if (t === 'up') {
      return 'Al alza';
    }
    if (t === 'down') {
      return 'A la baja';
    }
    return 'Estable';
  }

  protected trendClass(t: (typeof ADMIN_KPIS_MOCK)[number]['trend']): string {
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
