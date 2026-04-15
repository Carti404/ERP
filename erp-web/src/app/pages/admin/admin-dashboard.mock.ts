/** Datos demo para el panel admin hasta conectar API. */

import type { KpiMiniChartConfig } from '../../shared/kpi/kpi-chart.model';
import { type KpiTone, KPI_TONE_HEX } from '../../shared/kpi/kpi-tone';

export type { KpiTone };
export { KPI_TONE_HEX };

export interface AdminKpiMock {
  id: string;
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
  tone: KpiTone;
  chart: KpiMiniChartConfig;
}

export const ADMIN_KPIS_MOCK: AdminKpiMock[] = [
  {
    id: 'mermas',
    label: 'Mermas (semana)',
    value: '0 reportes',
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
    value: '0%',
    sub: 'Promedio general',
    trend: 'up',
    tone: 'emerald',
    chart: {
      kind: 'donut',
      donut: [
        { pct: 0, color: '#10b981' },
        { pct: 100, color: 'rgb(148 163 184 / 0.35)' },
      ],
    },
  },
  {
    id: 'pend',
    label: 'Órdenes de producción sin asignar',
    value: '0',
    sub: 'Delegación pendiente',
    trend: 'neutral',
    tone: 'cyan',
    chart: {
      kind: 'area',
      values: [0, 0, 0, 0, 0, 0, 0],
    },
  },
];



/** Referencia Stitch: Dashboard Admin — Premium KPI (`62530c2c70434907bf62b53da2574e7d`). */
export type AttendanceCalDayKind = 'muted' | 'ok' | 'warning' | 'critical' | 'weekend';

export interface AttendanceCalDayMock {
  d: string;
  kind: AttendanceCalDayKind;
}

export interface AttendanceCalendarPanelMock {
  title: string;
  weekDays: readonly string[];
  days: AttendanceCalDayMock[];
  critical: { title: string; body: string };
}

export const ADMIN_ATTENDANCE_CALENDAR_MOCK: AttendanceCalendarPanelMock = {
  title: 'Control de Asistencia',
  weekDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  days: [
    { d: '28', kind: 'muted' },
    { d: '29', kind: 'muted' },
    { d: '30', kind: 'muted' },
    { d: '1', kind: 'ok' },
    { d: '2', kind: 'ok' },
    { d: '3', kind: 'weekend' },
    { d: '4', kind: 'weekend' },
    { d: '5', kind: 'ok' },
    { d: '6', kind: 'ok' },
    { d: '7', kind: 'warning' },
    { d: '8', kind: 'ok' },
    { d: '9', kind: 'critical' },
    { d: '10', kind: 'weekend' },
    { d: '11', kind: 'weekend' },
  ],
  critical: {
    title: 'Incidencia Crítica',
    body: 'Falla en transporte logístico afectó al 12% del personal en el día 09.',
  },
};


