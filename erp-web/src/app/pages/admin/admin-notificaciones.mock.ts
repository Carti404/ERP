/** Notificaciones / alertas — administrador (demo, Stitch Alerts Center). */

export interface AdminNotifProductionMock {
  readonly id: string;
  readonly severity: 'critical' | 'warning';
  readonly badge: string;
  readonly time: string;
  readonly title: string;
  readonly body: string;
  readonly actions: readonly { label: string; variant: 'primary' | 'secondary' | 'danger' }[];
}

export interface AdminNotifHrCardMock {
  readonly id: string;
  readonly initials: string;
  readonly name: string;
  readonly role: string;
  readonly title: string;
  readonly body: string;
  readonly actions: readonly { label: string; variant: 'approve' | 'deny' | 'single' }[];
}

export const ADMIN_NOTIF_STATS = { critical: '03', active: '14' } as const;

export const ADMIN_NOTIF_PRODUCTION: AdminNotifProductionMock[] = [
  {
    id: 'p1',
    severity: 'critical',
    badge: 'Parada crítica',
    time: '08:42',
    title: 'Línea 4: caída de presión hidráulica',
    body: 'Fallo en bomba secundaria de prensa HP-042. Se requiere mantenimiento inmediato para evitar sobrecalentamiento.',
    actions: [
      { label: 'Despachar equipo', variant: 'danger' },
      { label: 'Ver telemetría', variant: 'secondary' },
    ],
  },
  {
    id: 'p2',
    severity: 'warning',
    badge: 'Nivel de inventario',
    time: 'Ayer',
    title: 'Stock bajo: acero grado B',
    body: 'Inventario al 12% del umbral de seguridad. Agotamiento estimado en 48 h según órdenes activas.',
    actions: [{ label: 'Aprobar OC', variant: 'primary' }],
  },
];

export const ADMIN_NOTIF_HR: AdminNotifHrCardMock[] = [
  {
    id: 'h1',
    initials: 'RM',
    name: 'Robert Miller',
    role: 'Supervisor de logística',
    title: 'Solicitud de vacaciones: 5 días',
    body: 'Del 12 al 17 oct. Supervisor de respaldo asignado.',
    actions: [
      { label: 'Aprobar', variant: 'approve' },
      { label: 'Denegar', variant: 'deny' },
    ],
  },
  {
    id: 'h2',
    initials: 'SK',
    name: 'Sarah Koenig',
    role: 'Control de calidad',
    title: 'Justificación de turno faltante',
    body: 'Ausencia del 28 sept sin verificar. Requerido para nómina.',
    actions: [{ label: 'Enviar mensaje', variant: 'single' }],
  },
];

export const ADMIN_NOTIF_INBOX = {
  title: 'Nuevo mensaje en bandeja',
  sub: 'Asunto: resultados auditoría Q4 — sede central',
  cta: 'Abrir bandeja',
} as const;

export const ADMIN_NOTIF_SERVER = {
  title: 'Servidor principal: operativo',
  sub: 'Clústeres sincronizados. Latencia: 12 ms.',
  uptime: '99,9% uptime',
} as const;
