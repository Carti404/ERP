/** Producción — trabajador (demo, alineado a Stitch vista operario). */

export interface TrabajadorProduccionTaskMock {
  readonly title: string;
  readonly sku: string;
  readonly reported: number;
  readonly target: number;
  readonly pct: string;
}

export interface TrabajadorProduccionActivityMock {
  readonly time: string;
  readonly text: string;
}

export interface TrabajadorProduccionPeerMock {
  readonly id: string;
  readonly name: string;
  readonly pct: number;
  readonly segments: readonly ('primary' | 'secondary' | 'error' | 'muted')[];
  readonly variant: 'ok' | 'alert';
}

export const TRABAJADOR_PRODUCCION_TASK: TrabajadorProduccionTaskMock = {
  title: 'Tarea actual: válvula de presión V-44',
  sku: 'IC-990-22',
  reported: 1875,
  target: 2500,
  pct: '84.2%',
};

export const TRABAJADOR_PRODUCCION_INSUMOS = 'Acero 4140, lubricante X';
export const TRABAJADOR_PRODUCCION_MAQUINARIA = 'Torno CNC-08';

export const TRABAJADOR_PRODUCCION_RECIPE: { n: number; name: string; seconds: number }[] = [
  { n: 1, name: 'Corte térmico', seconds: 120 },
  { n: 2, name: 'Forjado en frío', seconds: 450 },
  { n: 3, name: 'Templado', seconds: 1800 },
];

/** Ángulo de aguja del semicírculo (0 = izquierda, 180 = derecha). */
export const TRABAJADOR_PRODUCCION_TAKT_NEEDLE_DEG = 118;

export const TRABAJADOR_PRODUCCION_TAKT_LABEL = 'En meta';

export const TRABAJADOR_PRODUCCION_ACTIVITIES: TrabajadorProduccionActivityMock[] = [
  { time: '14:30', text: '+50 unidades' },
  { time: '13:05', text: 'Pausa registrada' },
  { time: '11:40', text: '+120 unidades' },
  { time: '09:00', text: 'Inicio de lote' },
];

export const TRABAJADOR_PRODUCCION_PEERS: TrabajadorProduccionPeerMock[] = [
  {
    id: 'p1',
    name: 'Juan Pérez',
    pct: 85,
    segments: ['primary', 'primary', 'primary', 'primary', 'secondary', 'muted'],
    variant: 'ok',
  },
  {
    id: 'p2',
    name: 'Ana Martínez',
    pct: 92,
    segments: ['primary', 'primary', 'primary', 'primary', 'primary', 'muted'],
    variant: 'ok',
  },
  {
    id: 'p3',
    name: 'Luis Soto',
    pct: 42,
    segments: ['error', 'error', 'muted', 'muted', 'muted', 'muted'],
    variant: 'alert',
  },
];
