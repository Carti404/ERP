import type { KpiMiniChartConfig } from '../../shared/kpi/kpi-chart.model';
import type { KpiTone } from '../../shared/kpi/kpi-tone';

export interface WorkerKpiMock {
  id: string;
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
  tone: KpiTone;
  chart: KpiMiniChartConfig;
}

export const WORKER_KPIS_MOCK: WorkerKpiMock[] = [
  {
    id: 'oee',
    label: 'OEE turno',
    value: '88%',
    sub: 'Meta línea 85%',
    trend: 'up',
    tone: 'violet',
    chart: { kind: 'bars', values: [62, 70, 68, 75, 80, 82, 85, 88] },
  },
  {
    id: 'takt',
    label: 'Takt real',
    value: '4:12',
    sub: 'Objetivo 4:30',
    trend: 'up',
    tone: 'cyan',
    chart: { kind: 'area', values: [5.1, 4.9, 4.7, 4.5, 4.35, 4.2, 4.12] },
  },
  {
    id: 'units',
    label: 'Unidades OK',
    value: '324',
    sub: 'Lote actual',
    trend: 'neutral',
    tone: 'emerald',
    chart: {
      kind: 'donut',
      donut: [
        { pct: 72, color: '#10b981' },
        { pct: 28, color: 'rgb(148 163 184 / 0.35)' },
      ],
    },
  },
  {
    id: 'scrap',
    label: 'Scrap sesión',
    value: '1.2%',
    sub: 'Bajo control',
    trend: 'down',
    tone: 'amber',
    chart: { kind: 'bars', values: [2.8, 2.4, 2.1, 1.9, 1.5, 1.3, 1.2] },
  },
];

export interface WorkerInboxItemMock {
  id: string;
  initials: string;
  from: string;
  time: string;
  preview: string;
  dimmed?: boolean;
}

export const WORKER_INBOX_MOCK: WorkerInboxItemMock[] = [
  {
    id: '1',
    initials: 'SM',
    from: 'Jefe de turno',
    time: '10:45',
    preview: 'Revisar EPP en estación B-02 antes del cierre del turno.',
  },
  {
    id: '2',
    initials: 'RR',
    from: 'Recursos humanos',
    time: 'Ayer',
    preview: 'Nueva política de vacaciones disponible para revisión.',
    dimmed: true,
  },
];

export interface WorkerEventRowMock {
  id: string;
  type: string;
  typeIcon: string;
  description: string;
  time: string;
  status: string;
  statusVariant: 'dark' | 'secondary' | 'success';
}

export const WORKER_EVENTS_MOCK: WorkerEventRowMock[] = [
  {
    id: 'e1',
    type: 'Materia prima',
    typeIcon: 'inventory',
    description: 'Lote #7721 — Chapa aluminio entregada en estación.',
    time: '09:12',
    status: 'Registrado',
    statusVariant: 'dark',
  },
  {
    id: 'e2',
    type: 'Hito KPI',
    typeIcon: 'schedule',
    description: 'Objetivo OEE 2.ª hora alcanzado (88,4%).',
    time: '08:00',
    status: 'Logrado',
    statusVariant: 'success',
  },
  {
    id: 'e3',
    type: 'Inicio turno',
    typeIcon: 'badge',
    description: 'Marcaje en línea de soldadura B-02.',
    time: '06:00',
    status: 'Registrado',
    statusVariant: 'dark',
  },
];
