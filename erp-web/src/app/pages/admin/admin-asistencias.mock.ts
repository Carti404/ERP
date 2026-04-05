/** Asistencias — administrador (demo, Stitch Attendance Matrix). */

export type AdminAsistenciaCellKind = 'punctual' | 'delay' | 'absence' | 'justification' | 'off';

export interface AdminAsistenciaCell {
  readonly kind: AdminAsistenciaCellKind;
  /** Hora corta tipo "07:58" para puntual/retraso */
  readonly time?: string;
}

export interface AdminAsistenciaWorkerRow {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly highlightRow?: boolean;
  readonly cells: readonly AdminAsistenciaCell[];
}

export interface AdminAsistenciaActivityLogMock {
  readonly title: string;
  readonly range: string;
  readonly duration: string;
  readonly dot: 'primary' | 'secondary';
}

export interface AdminAsistenciaDetailMock {
  readonly workerName: string;
  readonly dayLabel: string;
  readonly checkIn: string;
  readonly checkInNote: string;
  readonly checkInUrgent?: boolean;
  readonly checkOut: string;
  readonly checkOutNote: string;
  readonly logs: readonly AdminAsistenciaActivityLogMock[];
  readonly justification?: {
    readonly text: string;
  };
}

export const ADMIN_ASISTENCIAS_KPIS = {
  avgEntryLabel: 'Hora media de entrada',
  avgEntryValue: '07:42',
  pendingLabel: 'Justificaciones pendientes',
  pendingValue: '14',
} as const;

export const ADMIN_ASISTENCIAS_WEEK_LABEL = '23–29 oct 2023';

export const ADMIN_ASISTENCIAS_DAY_HEADERS = [
  { key: 'mon', label: 'Lun 23' },
  { key: 'tue', label: 'Mar 24' },
  { key: 'wed', label: 'Mié 25' },
  { key: 'thu', label: 'Jue 26' },
  { key: 'fri', label: 'Vie 27' },
  { key: 'sat', label: 'Sáb 28' },
  { key: 'sun', label: 'Dom 29' },
] as const;

export const ADMIN_ASISTENCIAS_ROWS: AdminAsistenciaWorkerRow[] = [
  {
    id: 'w1',
    name: 'Marcos Rodríguez',
    initials: 'MR',
    cells: [
      { kind: 'punctual', time: '07:58' },
      { kind: 'punctual', time: '08:02' },
      { kind: 'delay', time: '08:45' },
      { kind: 'punctual', time: '07:55' },
      { kind: 'punctual', time: '07:50' },
      { kind: 'off' },
      { kind: 'off' },
    ],
  },
  {
    id: 'w2',
    name: 'Elena Vance',
    initials: 'EV',
    highlightRow: true,
    cells: [
      { kind: 'punctual', time: '07:45' },
      { kind: 'absence' },
      { kind: 'punctual', time: '07:59' },
      { kind: 'delay', time: '09:12' },
      { kind: 'punctual', time: '07:40' },
      { kind: 'off' },
      { kind: 'off' },
    ],
  },
  {
    id: 'w3',
    name: 'Jackson Miller',
    initials: 'JM',
    cells: [
      { kind: 'punctual', time: '08:00' },
      { kind: 'punctual', time: '08:10' },
      { kind: 'punctual', time: '07:55' },
      { kind: 'punctual', time: '07:52' },
      { kind: 'justification' },
      { kind: 'off' },
      { kind: 'off' },
    ],
  },
];

/** Detalle lateral cuando hay celda seleccionada (demo). */
export const ADMIN_ASISTENCIAS_DETAIL_BY_KEY: Record<string, AdminAsistenciaDetailMock> = {
  'w2-3': {
    workerName: 'Elena Vance',
    dayLabel: 'Jue 26 oct 2023',
    checkIn: '09:12',
    checkInNote: '+72 min retraso',
    checkInUrgent: true,
    checkOut: '17:45',
    checkOutNote: 'Normal',
    logs: [
      { title: 'Descanso comida', range: '12:30 – 13:15', duration: '45m', dot: 'secondary' },
      { title: 'Chequeo mantenimiento', range: '15:00 – 15:20', duration: '20m', dot: 'primary' },
    ],
    justification: {
      text: 'Huelga de transporte público en línea 4. Adjunto comprobante de incidencia del servicio.',
    },
  },
};

export function adminAsistenciaDetailKey(workerId: string, dayIndex: number): string {
  return `${workerId}-${dayIndex}`;
}
