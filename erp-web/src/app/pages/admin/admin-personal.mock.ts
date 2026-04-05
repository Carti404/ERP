/** Personal / trabajadores — administrador (demo, Stitch). */

export type AdminPersonalPinState = 'active' | 'inactive' | 'locked';
export type AdminPersonalRoleType = 'worker' | 'admin';

export interface AdminPersonalWorkerMock {
  readonly id: string;
  readonly name: string;
  readonly workerCode: string;
  readonly roleTitle: string;
  readonly department: string;
  readonly seniority: string;
  readonly roleType: AdminPersonalRoleType;
  readonly pinState: AdminPersonalPinState;
  /** Clases Tailwind para el punto de color */
  readonly colorDotClass: string;
  readonly initials: string;
  readonly inactive?: boolean;
  readonly statusSub?: string;
}

export const ADMIN_PERSONAL_KPIS = {
  total: { value: '248', sub: '+12 este mes', icon: 'groups' },
  active: { value: '231', sub: '93% capacidad operativa', icon: 'check_circle' },
  leave: { value: '17', sub: 'Bajas temporales activas', icon: 'event_busy' },
} as const;

export const ADMIN_PERSONAL_WORKERS: AdminPersonalWorkerMock[] = [
  {
    id: 'w1',
    name: 'Marco Antonio Solís',
    workerCode: 'ID-88291-X',
    roleTitle: 'Operario especialista',
    department: 'Línea de ensamblaje A',
    seniority: '4 años, 2 meses',
    roleType: 'worker',
    pinState: 'active',
    colorDotClass: 'bg-blue-500 ring-2 ring-white dark:ring-[var(--erp-login-card)]',
    initials: 'MS',
  },
  {
    id: 'w2',
    name: 'Elena Rodríguez',
    workerCode: 'ID-90112-S',
    roleTitle: 'Jefa de turno',
    department: 'Control de calidad',
    seniority: '7 años, 8 meses',
    roleType: 'admin',
    pinState: 'active',
    colorDotClass: 'bg-emerald-500 ring-2 ring-white dark:ring-[var(--erp-login-card)]',
    initials: 'ER',
  },
  {
    id: 'w3',
    name: 'Javier Méndez',
    workerCode: 'ID-44501-M',
    roleTitle: 'Mantenimiento',
    department: 'Electricidad',
    seniority: '1 año, 1 mes',
    roleType: 'worker',
    pinState: 'inactive',
    colorDotClass: 'bg-amber-500 ring-2 ring-white dark:ring-[var(--erp-login-card)]',
    initials: 'JM',
  },
  {
    id: 'w4',
    name: 'Lucas Ferreira',
    workerCode: 'ID-12290-L',
    roleTitle: 'Logística',
    department: '',
    seniority: '9 meses',
    roleType: 'worker',
    pinState: 'locked',
    colorDotClass: 'bg-slate-400 ring-2 ring-white dark:ring-[var(--erp-login-card)]',
    initials: 'LF',
    inactive: true,
    statusSub: 'De baja',
  },
];
