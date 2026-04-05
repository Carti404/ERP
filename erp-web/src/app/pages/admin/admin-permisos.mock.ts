/** Permisos y vacaciones — administrador (demo, alineado a Stitch). */

export interface AdminPermisoKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly sub: string;
  readonly icon: string;
  readonly tone?: 'neutral' | 'alert' | 'wide';
}

export const ADMIN_PERMISOS_KPIS: AdminPermisoKpi[] = [
  {
    id: 'ops',
    label: 'Total operarios',
    value: '142',
    sub: '94% disponibilidad',
    icon: 'group',
  },
  {
    id: 'pend',
    label: 'Pendientes',
    value: '12',
    sub: 'Acción requerida',
    icon: 'priority_high',
    tone: 'alert',
  },
  {
    id: 'cap',
    label: 'Alerta de capacidad',
    value: 'Taller estampado',
    sub: 'Crítico (72%) · mínimo 85%',
    icon: 'analytics',
    tone: 'wide',
  },
];

export type AdminPermisoBarVariant = 'vacaciones' | 'pendiente' | 'medico' | 'personal';

export interface AdminPermisoGanttBar {
  readonly label: string;
  readonly leftPct: number;
  readonly widthPct: number;
  readonly variant: AdminPermisoBarVariant;
}

export interface AdminPermisoGanttRow {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly area: string;
  readonly bars: AdminPermisoGanttBar[];
  readonly highlight?: boolean;
}

export const ADMIN_PERMISOS_GANTT_ROWS: AdminPermisoGanttRow[] = [
  {
    id: 'r1',
    initials: 'RM',
    name: 'Ricardo Mendoza',
    area: 'Línea de ensamble A',
    bars: [{ label: 'Vacaciones', leftPct: 15, widthPct: 10, variant: 'vacaciones' }],
  },
  {
    id: 'r2',
    initials: 'EL',
    name: 'Elena López',
    area: 'Control de calidad',
    bars: [{ label: 'Solicitud pendiente', leftPct: 35, widthPct: 15, variant: 'pendiente' }],
    highlight: true,
  },
  {
    id: 'r3',
    initials: 'JS',
    name: 'Javier Soler',
    area: 'Mantenimiento',
    bars: [{ label: 'Médico', leftPct: 60, widthPct: 5, variant: 'medico' }],
  },
  {
    id: 'r4',
    initials: 'MA',
    name: 'Marta Aranda',
    area: 'Línea de ensamble B',
    bars: [
      { label: 'Vacaciones', leftPct: 20, widthPct: 12, variant: 'vacaciones' },
      { label: 'Personal', leftPct: 80, widthPct: 8, variant: 'personal' },
    ],
  },
];

export const ADMIN_PERMISOS_TIMELINE_MARKERS = ['01 Oct', '05 Oct', '10 Oct', '15 Oct', '20 Oct', '25 Oct', '30 Oct'] as const;

export interface AdminPermisoPanelDetail {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly role: string;
  readonly periodFrom: { day: string; dow: string };
  readonly periodTo: { day: string; dow: string };
  readonly reason: string;
  readonly timeline: readonly { title: string; meta: string; dot: 'secondary' | 'urgent' }[];
}

/** Detalle lateral al seleccionar una fila del Gantt (demo). */
export const ADMIN_PERMISOS_PANEL_BY_ROW_ID: Record<string, AdminPermisoPanelDetail> = {
  r1: {
    id: 'VAC-2023-102',
    initials: 'RM',
    name: 'Ricardo Mendoza',
    role: 'Línea de ensamble A · Operador',
    periodFrom: { day: '18', dow: 'MIÉRCOLES' },
    periodTo: { day: '22', dow: 'DOMINGO' },
    reason: 'Vacaciones familiares planificadas. Cobertura acordada con el compañero de línea.',
    timeline: [
      { title: 'Solicitud enviada', meta: '10 sept, 16:20', dot: 'secondary' },
      { title: 'Aprobada por jefe de turno', meta: '11 sept, 08:05', dot: 'secondary' },
    ],
  },
  r2: {
    id: 'VAC-2023-149',
    initials: 'EL',
    name: 'Elena López',
    role: 'Control de calidad · Senior',
    periodFrom: { day: '12', dow: 'JUEVES' },
    periodTo: { day: '16', dow: 'LUNES' },
    reason:
      'Asunto familiar inaplazable. He coordinado con el supervisor de turno para que mis tareas críticas sean cubiertas por el equipo B.',
    timeline: [
      { title: 'Solicitud inicial', meta: '28 sept, 09:12', dot: 'secondary' },
      { title: 'Rechazo por capacidad', meta: '28 sept, 14:45 · Admin: «Falta personal en calidad»', dot: 'urgent' },
      { title: 'Nueva propuesta', meta: 'Hoy, 08:30 · Usuario: «Días ajustados»', dot: 'secondary' },
    ],
  },
  r3: {
    id: 'PER-2023-441',
    initials: 'JS',
    name: 'Javier Soler',
    role: 'Mantenimiento · Técnico',
    periodFrom: { day: '24', dow: 'MARTES' },
    periodTo: { day: '24', dow: 'MARTES' },
    reason: 'Consulta médica programada. Entrega de turno registrada en sistema.',
    timeline: [{ title: 'Registro automático', meta: '23 sept, 11:00', dot: 'secondary' }],
  },
  r4: {
    id: 'VAC-2023-201',
    initials: 'MA',
    name: 'Marta Aranda',
    role: 'Línea de ensamble B · Operadora',
    periodFrom: { day: '08', dow: 'DOMINGO' },
    periodTo: { day: '14', dow: 'SÁBADO' },
    reason: 'Descanso compensatorio y día personal en fechas separadas.',
    timeline: [
      { title: 'Solicitud múltiple', meta: '01 oct, 07:15', dot: 'secondary' },
      { title: 'En revisión RRHH', meta: '02 oct, 10:40', dot: 'urgent' },
    ],
  },
};
