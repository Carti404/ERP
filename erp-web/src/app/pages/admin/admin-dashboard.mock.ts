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
    id: 'prod',
    label: 'Productividad del turno',
    value: '87%',
    sub: 'vs. objetivo planta',
    trend: 'up',
    tone: 'violet',
    chart: {
      kind: 'bars',
      values: [38, 44, 41, 52, 49, 58, 55, 67, 72, 87],
    },
  },
  {
    id: 'mermas',
    label: 'Mermas (semana)',
    value: '124 kg',
    sub: 'Acumulado líneas activas',
    trend: 'neutral',
    tone: 'amber',
    chart: {
      kind: 'donut',
      donut: [
        { pct: 72, color: '#f59e0b' },
        { pct: 28, color: 'rgb(148 163 184 / 0.35)' },
      ],
    },
  },
  {
    id: 'asist',
    label: 'Asistencia hoy',
    value: '94%',
    sub: '42 / 45 presentes',
    trend: 'up',
    tone: 'emerald',
    chart: {
      kind: 'donut',
      donut: [
        { pct: 94, color: '#10b981' },
        { pct: 6, color: 'rgb(148 163 184 / 0.35)' },
      ],
    },
  },
  {
    id: 'pend',
    label: 'Cierres pendientes',
    value: '3',
    sub: 'Producción por aprobar',
    trend: 'down',
    tone: 'cyan',
    chart: {
      kind: 'area',
      values: [14, 11, 9, 10, 7, 5, 3],
    },
  },
];

export interface AdminAlertMock {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  time: string;
}

export const ADMIN_ALERTS_MOCK: AdminAlertMock[] = [
  {
    id: '1',
    type: 'warning',
    title: '2 apelaciones de permisos sin revisar',
    time: 'Hace 35 min',
  },
  {
    id: '2',
    type: 'info',
    title: 'Job de sincronización MT completado',
    time: 'Hace 2 h',
  },
  {
    id: '3',
    type: 'success',
    title: 'Cierre de lote L-884 aprobado',
    time: 'Ayer',
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

export type ShiftBarSegmentKind = 'done' | 'progress' | 'idle';

export interface ShiftProductionShiftMock {
  id: string;
  name: string;
  schedule: string;
  /** Texto derecho principal, p. ej. `100%` o `EN ESPERA`. */
  statusMain: string;
  /** Unidades u otro detalle (p. ej. `5.2k`). */
  statusSub?: string;
  segments: { kind: ShiftBarSegmentKind; pct: number }[];
}

export interface ShiftProductionPanelMock {
  title: string;
  objectiveLabel: string;
  legendDone: string;
  legendProgress: string;
  shifts: ShiftProductionShiftMock[];
  oeeLabel: string;
  oeeValue: string;
  availabilityLabel: string;
  availabilityValue: string;
  executiveCta: string;
}

export const ADMIN_SHIFT_PRODUCTION_MOCK: ShiftProductionPanelMock = {
  title: 'Métricas de Producción por Turno',
  objectiveLabel: 'Objetivo operacional: 15,000 unidades / día',
  legendDone: 'Finalizado',
  legendProgress: 'En Proceso',
  shifts: [
    {
      id: 'm',
      name: 'Turno Mañana',
      schedule: '06:00 - 14:00',
      statusMain: '100%',
      statusSub: '5.2k',
      segments: [{ kind: 'done', pct: 100 }],
    },
    {
      id: 't',
      name: 'Turno Tarde',
      schedule: '14:00 - 22:00',
      statusMain: '78%',
      statusSub: '4.1k',
      segments: [
        { kind: 'done', pct: 60 },
        { kind: 'progress', pct: 18 },
      ],
    },
    {
      id: 'n',
      name: 'Turno Noche',
      schedule: '22:00 - 06:00',
      statusMain: 'EN ESPERA',
      segments: [],
    },
  ],
  oeeLabel: 'OEE Real',
  oeeValue: '78.4%',
  availabilityLabel: 'Disponibilidad',
  availabilityValue: '94.1%',
  executiveCta: 'Reporte Ejecutivo',
};
