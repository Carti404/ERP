/** Permisos y vacaciones — trabajador (demo). */

export type WorkerPermisoHistoryStatus = 'propuesta_admin' | 'aprobado' | 'revision';

export interface WorkerPermisoHistoryItem {
  readonly id: string;
  readonly title: string;
  readonly dateRange: string;
  readonly daysLabel: string;
  readonly status: WorkerPermisoHistoryStatus;
  readonly negotiation?: {
    readonly from: string;
    readonly message: string;
  };
}

export const WORKER_PERMISOS_BALANCE = {
  availableDays: 14,
  periodLabel: 'Periodo 2023–2024',
  requested: 5,
  approved: 8,
} as const;

export const WORKER_PERMISOS_HISTORY: WorkerPermisoHistoryItem[] = [
  {
    id: 'h1',
    title: 'Vacaciones invierno',
    dateRange: '12 oct 2023 — 16 oct 2023',
    daysLabel: '5 días laborables',
    status: 'propuesta_admin',
    negotiation: {
      from: 'Admin planta',
      message:
        'Propongo mover tu salida al 14 oct por cobertura en calidad. ¿Aceptas el cambio o prefieres rechazar y mantener la solicitud original?',
    },
  },
  {
    id: 'h2',
    title: 'Permiso médico',
    dateRange: '03 oct 2023',
    daysLabel: '1 día',
    status: 'aprobado',
  },
  {
    id: 'h3',
    title: 'Asuntos propios',
    dateRange: '22 oct 2023',
    daysLabel: '1 día',
    status: 'revision',
  },
];
