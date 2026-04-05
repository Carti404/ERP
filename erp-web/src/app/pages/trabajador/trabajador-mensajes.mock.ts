/** Buzón / mensajería trabajador (demo hasta API). */

export type WorkerMailboxFolderId = 'inbox' | 'sent' | 'drafts' | 'archive' | 'critical';

/** Tono visual en lista y lector (buzón trabajador). */
export type WorkerMailboxAccent = 'turno' | 'rrhh' | 'sistema' | 'compañero' | 'enviado' | 'general';

export interface WorkerMailboxMessage {
  readonly id: string;
  readonly folder: WorkerMailboxFolderId;
  readonly accent?: WorkerMailboxAccent;
  readonly from: string;
  readonly fromEmail: string;
  readonly timeLabel: string;
  readonly timeDetail: string;
  readonly subject: string;
  readonly preview: string;
  readonly read: boolean;
  readonly urgent?: boolean;
  readonly hasAttachment?: boolean;
  readonly bodyParagraphs: readonly string[];
  readonly attachments?: ReadonlyArray<{ name: string; sizeLabel: string; kind: 'image' | 'pdf' | 'other' }>;
  readonly thread?: ReadonlyArray<{
    from: string;
    email: string;
    time: string;
    body: string;
    system?: boolean;
  }>;
}

export const WORKER_MAILBOX_FOLDERS: ReadonlyArray<{
  id: WorkerMailboxFolderId;
  label: string;
  icon: string;
  badge?: string;
  criticalIcon?: boolean;
}> = [
  { id: 'inbox', label: 'Bandeja', icon: 'inbox', badge: '4' },
  { id: 'sent', label: 'Enviados', icon: 'send', badge: '1' },
  { id: 'drafts', label: 'Borradores', icon: 'draft', badge: '1' },
  { id: 'archive', label: 'Archivo', icon: 'archive', badge: '1' },
  { id: 'critical', label: 'Críticos', icon: 'report_problem', badge: '1', criticalIcon: true },
];

/** Contactos sugeridos al redactar “Nuevo mensaje” (demo hasta directorio real). */
export interface WorkerMailboxContactSuggestion {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hint?: string;
}

export const WORKER_MAILBOX_CONTACT_SUGGESTIONS: readonly WorkerMailboxContactSuggestion[] = [
  { id: 'c-turno', name: 'Jefe de turno', email: 'turno@planta.demo', hint: 'Supervisión' },
  { id: 'c-rrhh', name: 'Recursos humanos', email: 'rrhh@planta.demo', hint: 'RRHH' },
  { id: 'c-sistema', name: 'Sistema — producción', email: 'sistema@planta.demo', hint: 'Automático' },
  { id: 'c-mant', name: 'Mantenimiento', email: 'mantenimiento@planta.demo', hint: 'Técnico' },
  { id: 'c-cal', name: 'Calidad', email: 'calidad@planta.demo', hint: 'QC' },
  { id: 'c-l3', name: 'Línea 3 — operadores', email: 'linea3@planta.demo', hint: 'Equipo' },
  { id: 'c-seg', name: 'Seguridad industrial', email: 'seguridad@planta.demo', hint: 'EPP' },
];

export const WORKER_MAILBOX_MESSAGES: WorkerMailboxMessage[] = [
  {
    id: 'w1',
    folder: 'inbox',
    from: 'Jefe de turno',
    fromEmail: 'turno@planta.demo',
    timeLabel: '10:45',
    timeDetail: '10:45 (hoy)',
    subject: 'EPP obligatorio en línea de ensamble',
    preview: 'Recordatorio: usar casco y calzado de seguridad en sector B antes del reinicio del lote…',
    read: false,
    urgent: true,
    accent: 'turno',
    bodyParagraphs: [
      'Equipo,',
      'Recordatorio: EPP completo en línea de ensamble B antes del reinicio del lote. Cualquier incidencia avisar por este canal.',
      'Gracias.',
    ],
  },
  {
    id: 'w2',
    folder: 'inbox',
    from: 'Recursos humanos',
    fromEmail: 'rrhh@planta.demo',
    timeLabel: '09:05',
    timeDetail: '09:05 (hoy)',
    subject: 'Actualización de política de vacaciones',
    preview: 'Ya está publicada la nueva política en el portal interno. Resumen de cambios adjunto…',
    read: false,
    hasAttachment: true,
    accent: 'rrhh',
    bodyParagraphs: [
      'Hola,',
      'La nueva política de vacaciones ya está en el portal interno. Resumen: solicitudes con 15 días de anticipación y aprobación de jefe directo.',
    ],
    attachments: [{ name: 'Resumen_vacaciones.pdf', sizeLabel: '180 KB', kind: 'pdf' }],
  },
  {
    id: 'w3',
    folder: 'inbox',
    from: 'Sistema — producción',
    fromEmail: 'sistema@planta.demo',
    timeLabel: 'Ayer',
    timeDetail: 'Ayer 16:40',
    subject: 'Parada programada línea 2 (martes)',
    preview: 'Ventana de mantenimiento 06:00–08:00. Confirmar liberación de estación al salir del turno…',
    read: true,
    accent: 'sistema',
    bodyParagraphs: [
      'Se programó parada de línea 2 el martes 06:00–08:00. Por favor libera la estación y registra cualquier anomalía en el checklist del turno.',
    ],
  },
  {
    id: 'w4',
    folder: 'inbox',
    from: 'Compañero — Línea 3',
    fromEmail: 'operador.l3@planta.demo',
    timeLabel: 'Ayer',
    timeDetail: 'Ayer 14:12',
    subject: 'Cambio de turno: repuesto sensor',
    preview: 'Dejé el repuesto en casillero 12. Código de lote en la etiqueta verde…',
    read: true,
    accent: 'compañero',
    bodyParagraphs: [
      'Hola,',
      'Dejé el sensor de repuesto en casillero 12 (etiqueta verde, lote SR-992). Avísame si no lo encuentras.',
    ],
  },
  {
    id: 'w5',
    folder: 'sent',
    from: 'Tú',
    fromEmail: 'trabajador@planta.demo',
    timeLabel: 'Lun',
    timeDetail: 'Lunes 11:20',
    subject: 'Consulta tiempo extra turno noche',
    preview: 'Solicito confirmación de horas registradas el viernes pasado…',
    read: true,
    accent: 'enviado',
    bodyParagraphs: [
      'Buenos días,',
      '¿Podrían confirmar las horas extra del viernes en turno noche? Gracias.',
    ],
  },
  {
    id: 'w6',
    folder: 'drafts',
    from: 'Borrador',
    fromEmail: '',
    timeLabel: '—',
    timeDetail: 'Sin enviar',
    subject: 'Solicitud de cambio de turno (borrador)',
    preview: 'Solicito considerar cambio a turno matutino a partir de la próxima quincena por motivos familiares…',
    read: true,
    accent: 'general',
    bodyParagraphs: [
      '(Borrador) Solicito considerar cambio a turno matutino a partir de la próxima quincena por motivos familiares. Quedo atento.',
    ],
  },
  {
    id: 'w7',
    folder: 'archive',
    from: 'Calidad — Línea 1',
    fromEmail: 'calidad@planta.demo',
    timeLabel: '15 mar',
    timeDetail: '15 mar 09:00',
    subject: 'Cierre de no conformidad menor #882',
    preview: 'Se da por cerrada la NC tras verificación en segunda inspección. Registro archivado…',
    read: true,
    accent: 'general',
    bodyParagraphs: [
      'Hola,',
      'La no conformidad menor #882 queda cerrada tras la verificación en segunda inspección. Este mensaje queda archivado solo para consulta.',
    ],
  },
];
