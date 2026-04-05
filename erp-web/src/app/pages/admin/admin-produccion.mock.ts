/** Producción — administrador (demo, alineado a Stitch Plant Operations). */

export interface AdminProduccionLoadMock {
  readonly label: string;
  readonly pct: string;
  readonly trend: string;
  readonly totalPieces: string;
}

export interface AdminProduccionAlertMock {
  readonly badge: string;
  readonly title: string;
  readonly sub: string;
}

export type AdminProduccionDeadlineTone = 'ok' | 'urgent';

export interface AdminProduccionRequirementMock {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly qtyLabel: string;
  readonly deadline: string;
  readonly deadlineTone: AdminProduccionDeadlineTone;
  readonly delegationPct: number;
  readonly delegationLabel: string;
}

export interface AdminProduccionRecipeStepMock {
  readonly n: number;
  readonly name: string;
  readonly seconds: number;
}

export interface AdminProduccionDelegationOperatorMock {
  readonly id: string;
  readonly name: string;
  readonly defaultQty: number;
}

export type AdminProduccionSegmentKind = 'primary' | 'secondary' | 'error' | 'muted';

export interface AdminProduccionSupervisionWorkerMock {
  readonly id: string;
  readonly name: string;
  readonly shift: string;
  readonly pct: number;
  readonly meta: number;
  readonly prod: number;
  readonly segments: readonly AdminProduccionSegmentKind[];
  readonly variant: 'ok' | 'warn' | 'alert';
  readonly statusLine?: string;
}

export const ADMIN_PRODUCCION_LOAD: AdminProduccionLoadMock = {
  label: 'Carga de producción actual',
  pct: '84.2%',
  trend: '+5.4% vs ayer',
  totalPieces: '12,450',
};

export const ADMIN_PRODUCCION_ALERT: AdminProduccionAlertMock = {
  badge: 'Alerta',
  title: '3 Mermas',
  sub: 'Sección forja pesada',
};

export const ADMIN_PRODUCCION_REQUIREMENTS: AdminProduccionRequirementMock[] = [
  {
    id: 'r1',
    name: 'Válvula de presión V-44',
    sku: 'SKU: IC-990-22',
    qtyLabel: '2,500 pzs',
    deadline: '12 may 2024',
    deadlineTone: 'ok',
    delegationPct: 75,
    delegationLabel: '75% asignado',
  },
  {
    id: 'r2',
    name: 'Eje de transmisión T-1',
    sku: 'SKU: IC-112-00',
    qtyLabel: '450 pzs',
    deadline: 'Hoy, 18:00',
    deadlineTone: 'urgent',
    delegationPct: 20,
    delegationLabel: '20% asignado',
  },
];

export const ADMIN_PRODUCCION_INSUMOS = 'Acero 4140, lubricante X';
export const ADMIN_PRODUCCION_MAQUINARIA = 'Torno CNC-08';

export const ADMIN_PRODUCCION_RECIPE: AdminProduccionRecipeStepMock[] = [
  { n: 1, name: 'Corte térmico', seconds: 120 },
  { n: 2, name: 'Forjado en frío', seconds: 450 },
  { n: 3, name: 'Templado', seconds: 1800 },
];

export const ADMIN_PRODUCCION_DELEGATION_OPS: AdminProduccionDelegationOperatorMock[] = [
  { id: 'juan', name: 'Juan Pérez', defaultQty: 1200 },
  { id: 'ana', name: 'Ana Martínez', defaultQty: 800 },
  { id: 'luis', name: 'Luis Soto', defaultQty: 500 },
];

export const ADMIN_PRODUCCION_DELEGATION_TARGET = 2500;

export interface AdminProduccionAsignacionMock {
  readonly orden: string;
  readonly producto: string;
  readonly operador: string;
  readonly cantidad: string;
  readonly estado: string;
}

export const ADMIN_PRODUCCION_ASIGNACIONES: AdminProduccionAsignacionMock[] = [
  { orden: 'OT-10492', producto: 'Válvula V-44', operador: 'Juan Pérez', cantidad: '1,200', estado: 'En curso' },
  { orden: 'OT-10493', producto: 'Válvula V-44', operador: 'Ana Martínez', cantidad: '800', estado: 'En curso' },
  { orden: 'OT-10488', producto: 'Eje T-1', operador: 'Luis Soto', cantidad: '90', estado: 'Retraso' },
];

export const ADMIN_PRODUCCION_SUPERVISION: AdminProduccionSupervisionWorkerMock[] = [
  {
    id: 'w1',
    name: 'Juan Pérez',
    shift: 'Turno A',
    pct: 85,
    meta: 1200,
    prod: 1020,
    segments: ['primary', 'primary', 'primary', 'primary', 'secondary', 'muted'],
    variant: 'ok',
  },
  {
    id: 'w2',
    name: 'Ana Martínez',
    shift: 'Turno A',
    pct: 92,
    meta: 800,
    prod: 736,
    segments: ['primary', 'primary', 'primary', 'primary', 'primary', 'muted'],
    variant: 'ok',
  },
  {
    id: 'w3',
    name: 'Luis Soto',
    shift: 'Turno A',
    pct: 42,
    meta: 500,
    prod: 210,
    segments: ['error', 'error', 'muted', 'muted', 'muted', 'muted'],
    variant: 'alert',
    statusLine: 'Alerta merma',
  },
];
