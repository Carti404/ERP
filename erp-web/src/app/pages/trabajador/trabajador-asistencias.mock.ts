/** Asistencias — trabajador (demo, Stitch Personal Attendance). */

export type TrabajadorAsistenciaDiaEstado = 'punctual' | 'delay' | 'absence' | 'empty';

export interface TrabajadorAsistenciaCalDay {
  readonly d: number | null;
  readonly estado: TrabajadorAsistenciaDiaEstado;
  readonly selected?: boolean;
}

export interface TrabajadorJustificacionHistorialMock {
  readonly id: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly type: string;
  readonly date: string;
  readonly description: string;
}

export const TRABAJADOR_ASISTENCIAS_MES_LABEL = 'Octubre 2023';

export const TRABAJADOR_ASISTENCIAS_WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

/** Primer día octubre 2023 = domingo → padding 6 celdas vacías antes del 1 */
export const TRABAJADOR_ASISTENCIAS_DAYS: TrabajadorAsistenciaCalDay[] = [
  ...Array.from({ length: 6 }, () => ({ d: null, estado: 'empty' as const })),
  { d: 1, estado: 'punctual' },
  { d: 2, estado: 'punctual' },
  { d: 3, estado: 'delay' },
  { d: 4, estado: 'punctual' },
  { d: 5, estado: 'absence' },
  { d: 6, estado: 'punctual' },
  { d: 7, estado: 'punctual' },
  { d: 8, estado: 'delay' },
  { d: 9, estado: 'punctual' },
  { d: 10, estado: 'punctual' },
  { d: 11, estado: 'punctual' },
  { d: 12, estado: 'delay' },
  { d: 13, estado: 'punctual' },
  { d: 14, estado: 'absence' },
  { d: 15, estado: 'punctual' },
  { d: 16, estado: 'punctual' },
  { d: 17, estado: 'punctual' },
  { d: 18, estado: 'delay' },
  { d: 19, estado: 'punctual' },
  { d: 20, estado: 'punctual' },
  { d: 21, estado: 'absence' },
  { d: 22, estado: 'punctual' },
  { d: 23, estado: 'punctual' },
  { d: 24, estado: 'delay' },
  { d: 25, estado: 'punctual' },
  { d: 26, estado: 'punctual' },
  { d: 27, estado: 'punctual' },
  { d: 28, estado: 'punctual' },
  { d: 29, estado: 'punctual' },
  { d: 30, estado: 'punctual' },
  { d: 31, estado: 'punctual', selected: true },
];

export const TRABAJADOR_ASISTENCIAS_STATS = {
  punctual: 20,
  delays: 5,
  absences: 4,
} as const;

export const TRABAJADOR_ASISTENCIAS_JUST_TYPES = [
  { id: 'med', label: 'Baja médica' },
  { id: 'delay', label: 'Justificación de retraso' },
  { id: 'abs', label: 'Ausencia' },
  { id: 'pers', label: 'Asunto personal' },
] as const;

export const TRABAJADOR_ASISTENCIAS_SHIFTS = [
  { id: 'morning', label: 'Mañana' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'night', label: 'Noche' },
] as const;

export const TRABAJADOR_ASISTENCIAS_HISTORIAL: TrabajadorJustificacionHistorialMock[] = [
  {
    id: 'h1',
    status: 'pending',
    type: 'Ausencia',
    date: '05 oct 2023',
    description: 'Cita médica — Dr. Henderson',
  },
  {
    id: 'h2',
    status: 'approved',
    type: 'Retraso',
    date: '03 oct 2023',
    description: 'Validado con informe de transporte — RR.HH.',
  },
  {
    id: 'h3',
    status: 'rejected',
    type: 'Ausencia',
    date: '28 sept 2023',
    description: 'Falta documentación. Vuelva a enviar con certificado.',
  },
];
