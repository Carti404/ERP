/** Datos demo bandeja / mensajería hasta conectar API. */

export type AdminInboxFolderId = 'inbox' | 'sent' | 'drafts' | 'archive' | 'critical';

/** Misma paleta que el buzón trabajador (lista / lector). */
export type AdminMailboxAccent = 'turno' | 'rrhh' | 'sistema' | 'compañero' | 'enviado' | 'general';

export interface AdminInboxMessage {
  readonly id: string;
  readonly folder: AdminInboxFolderId;
  readonly accent?: AdminMailboxAccent;
  readonly from: string;
  readonly fromEmail: string;
  readonly timeLabel: string;
  readonly timeDetail: string;
  readonly subject: string;
  readonly preview: string;
  readonly read: boolean;
  readonly urgent?: boolean;
  readonly hasAttachment?: boolean;
  readonly hasImage?: boolean;
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

export const ADMIN_INBOX_FOLDERS: ReadonlyArray<{
  id: AdminInboxFolderId;
  label: string;
  icon: string;
  badge?: string;
  criticalIcon?: boolean;
}> = [
  { id: 'inbox', label: 'Bandeja', icon: 'inbox', badge: '12' },
  { id: 'sent', label: 'Enviados', icon: 'send' },
  { id: 'drafts', label: 'Borradores', icon: 'draft' },
  { id: 'archive', label: 'Archivo', icon: 'archive' },
  { id: 'critical', label: 'Críticos', icon: 'report_problem', criticalIcon: true },
];

/** Sugerencias al redactar (demo). */
export interface AdminMailboxContactSuggestion {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hint?: string;
}

export const ADMIN_MAILBOX_CONTACT_SUGGESTIONS: readonly AdminMailboxContactSuggestion[] = [
  { id: 's-l4', name: 'Planta — Línea 4', email: 'linea4@planta.demo', hint: 'Producción' },
  { id: 's-mt', name: 'Marcus Thorne', email: 'm.thorne@planta.demo', hint: 'Mantenimiento' },
  { id: 's-inv', name: 'Bot inventario', email: 'inventario@planta.demo', hint: 'Automático' },
  { id: 's-sj', name: 'Sarah Jenkins', email: 's.jenkins@planta.demo', hint: 'Operaciones' },
  { id: 's-sup', name: 'Soporte admin', email: 'soporte@planta.demo', hint: 'TI' },
  { id: 's-turno', name: 'Jefe de turno', email: 'turno@planta.demo', hint: 'Supervisión' },
  { id: 's-rrhh', name: 'Recursos humanos', email: 'rrhh@planta.demo', hint: 'RRHH' },
];

export const ADMIN_INBOX_MESSAGES: AdminInboxMessage[] = [
  {
    id: 'm1',
    folder: 'inbox',
    from: 'Planta — Línea 4',
    fromEmail: 'linea4@planta.demo',
    timeLabel: '10:45',
    timeDetail: '10:45 (hace 2 h)',
    subject: 'Urgente: error de calibración unidad de refrigeración',
    preview:
      'El ensamble de refrigeración en sector 4 reportó una variación fuera del umbral de seguridad. Se requiere inspección inmediata…',
    read: false,
    urgent: true,
    hasAttachment: true,
    accent: 'turno',
    bodyParagraphs: [
      'Equipo,',
      'El ensamble de refrigeración en sector 4 reportó una variación fuera del umbral de seguridad. Se requiere inspección inmediata antes del siguiente ciclo de producción.',
      'Quedamos atentos a la confirmación de mantenimiento.',
    ],
    attachments: [{ name: 'log_sensores.csv', sizeLabel: '24 KB', kind: 'other' }],
  },
  {
    id: 'm2',
    folder: 'inbox',
    from: 'Marcus Thorne',
    fromEmail: 'm.thorne@planta.demo',
    timeLabel: '09:12',
    timeDetail: '09:12 (hoy)',
    subject: 'Programa de mantenimiento Q3',
    preview:
      'Adjunto el calendario actualizado para los ciclos de mantenimiento del tercer trimestre. Optimizamos las ventanas de parada…',
    read: true,
    hasAttachment: true,
    accent: 'general',
    bodyParagraphs: [
      'Hola,',
      'Adjunto el calendario actualizado para los ciclos de mantenimiento del tercer trimestre. Optimizamos las ventanas de parada para minimizar impacto en OEE.',
      'Saludos,',
      'Marcus',
    ],
  },
  {
    id: 'm3',
    folder: 'inbox',
    from: 'Bot inventario',
    fromEmail: 'inventario@planta.demo',
    timeLabel: 'Ayer',
    timeDetail: 'Ayer 17:20',
    subject: 'Alerta de existencias: acero aleado 402',
    preview:
      'Las existencias de acero de alta resistencia 402 están por debajo del punto de reorden de 500 unidades…',
    read: true,
    accent: 'sistema',
    bodyParagraphs: [
      'Las existencias de acero de alta resistencia 402 están por debajo del punto de reorden de 500 unidades. Sugerencia de orden automática generada.',
    ],
  },
  {
    id: 'm4',
    folder: 'inbox',
    from: 'Sarah Jenkins',
    fromEmail: 's.jenkins@planta.demo',
    timeLabel: '08:30',
    timeDetail: '08:30 (hace 3 h)',
    subject: 'Fotos de taller y auditoría de seguridad',
    preview:
      'Adjunto las capturas del nuevo área de ensamble de turbinas. La auditoría de seguridad se completó esta mañana…',
    read: true,
    hasImage: true,
    accent: 'compañero',
    bodyParagraphs: [
      'Hola equipo,',
      'Adjunto las capturas del nuevo área de ensamble de turbinas. Completamos el recorrido de seguridad esta mañana a las 07:00.',
      'Todo cumple con la normativa aplicable. Destacamos el refuerzo de carcasa en la unidad 4 según lo solicitó el arquitecto líder.',
      'Saludos,',
      'Sarah',
    ],
    attachments: [
      { name: 'turbina_area_01.jpg', sizeLabel: '1.1 MB', kind: 'image' },
      { name: 'turbina_area_02.jpg', sizeLabel: '980 KB', kind: 'image' },
      { name: 'Safety_Audit_Log.pdf', sizeLabel: '1.2 MB', kind: 'pdf' },
    ],
    thread: [
      {
        from: 'Sistema (auto)',
        email: 'no-reply@planta.demo',
        time: '08:31',
        body: 'Se generó automáticamente el ticket #4492-B para esta auditoría de seguridad.',
        system: true,
      },
    ],
  },
  {
    id: 'm5',
    folder: 'inbox',
    from: 'Soporte admin',
    fromEmail: 'soporte@planta.demo',
    timeLabel: 'Ayer',
    timeDetail: 'Ayer 09:00',
    subject: 'Aviso de actualización del sistema',
    preview: 'El núcleo del ERP tendrá mantenimiento programado el domingo de 02:00 a 04:00 UTC…',
    read: true,
    accent: 'sistema',
    bodyParagraphs: [
      'El núcleo del ERP tendrá mantenimiento programado el domingo de 02:00 a 04:00 UTC. Durante la ventana algunos módulos pueden no estar disponibles.',
    ],
  },
  {
    id: 'm6',
    folder: 'sent',
    from: 'Jefe de turno',
    fromEmail: 'turno@planta.demo',
    timeLabel: 'Lun',
    timeDetail: 'Lunes 14:02',
    subject: 'RE: Parada programada línea 2',
    preview: 'Confirmo la ventana acordada para el martes 06:00–08:00…',
    read: true,
    accent: 'enviado',
    bodyParagraphs: ['Confirmo la ventana acordada para el martes 06:00–08:00. Quedamos en contacto.'],
  },
  {
    id: 'm7',
    folder: 'drafts',
    from: 'Borrador',
    fromEmail: '',
    timeLabel: '—',
    timeDetail: 'Sin enviar',
    subject: 'Informe semanal de scrap',
    preview: 'Adjunto el consolidado de mermas por línea…',
    read: true,
    accent: 'general',
    bodyParagraphs: ['(Borrador) Adjunto el consolidado de mermas por línea.'],
  },
];
