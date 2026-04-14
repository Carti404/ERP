import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { apiBaseUrl } from '../../core/environment';
import { AuthService } from '../../core/auth/auth.service';
import { MessagesApiService } from '../../core/messages/messages-api.service';
import type {
  ErpMessageFolder,
  ErpMessageParticipant,
  ErpMessageRow,
  ErpMessageAttachment,
} from '../../core/messages/messages-api.types';
import type { ErpUserPublic } from '../../core/users/users-api.types';

type InboxFolderId = ErpMessageFolder;

interface ErpInboxMessageVm {
  readonly id: string;
  readonly from: string;
  readonly fromEmail: string | null;
  readonly timeLabel: string;
  readonly timeDetail: string;
  readonly subject: string;
  readonly preview: string;
  readonly read: boolean;
  readonly bodyParagraphs: readonly string[];
  readonly importance: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly attachments: readonly {
    readonly id: string;
    readonly filename: string;
    readonly url: string;
    readonly previewUrl: string;
    readonly mimetype: string;
    readonly size: number;
    readonly isImage: boolean;
  }[];
}

interface MailboxComposeRecipient {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface MailboxContactSuggestion {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly hint?: string;
}

function formatMessageTimes(iso: string): { timeLabel: string; timeDetail: string } {
  const d = new Date(iso);
  return {
    timeLabel: d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    timeDetail: d.toLocaleString('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  };
}

function bodyToParagraphs(body: string): string[] {
  const t = body.trim();
  if (!t) {
    return [];
  }
  return t.split(/\r?\n/).filter((line) => line.length > 0);
}

function previewFromBody(body: string): string {
  const oneLine = body.replace(/\s+/g, ' ').trim();
  return oneLine.length > 120 ? `${oneLine.slice(0, 117)}…` : oneLine;
}

function roleHint(role: ErpUserPublic['role']): string {
  return role === 'admin' ? 'Administración' : 'Trabajador';
}

function replySubjectLine(subject: string): string {
  const t = subject.trim();
  if (/^re:\s/i.test(t)) {
    return t;
  }
  return `Re: ${t}`;
}

function forwardSubjectLine(subject: string): string {
  const t = subject.trim();
  if (/^fwd:\s/i.test(t)) {
    return t;
  }
  return `Fwd: ${t}`;
}

function participantToChip(p: ErpMessageParticipant): MailboxComposeRecipient {
  return {
    id: p.id,
    name: p.fullName,
    email: p.email ?? p.username,
  };
}

@Component({
  selector: 'app-erp-inbox',
  standalone: true,
  templateUrl: './erp-inbox.component.html',
})
export class ErpInboxComponent {
  readonly pageTitle = input('Mensajería');
  readonly pageSubtitle = input(
    'Bandeja de entrada y mensajes enviados entre usuarios del sistema.',
  );
  readonly sidebarHeading = input('Comunicaciones');
  readonly sidebarSub = input('Mensajería interna');

  private readonly messagesApi = inject(MessagesApiService);
  private readonly auth = inject(AuthService);

  private readonly inboxRows = signal<ErpMessageRow[]>([]);
  private readonly sentRows = signal<ErpMessageRow[]>([]);

  protected readonly folder = signal<InboxFolderId>('inbox');

  protected readonly searchQuery = signal('');

  protected readonly selectedId = signal<string | null>(null);

  protected readonly mobilePane = signal<'list' | 'reader'>('list');

  protected readonly composeOpen = signal(false);

  protected readonly composePanelTitle = signal('Nuevo mensaje');

  protected readonly composeRecipients = signal<MailboxComposeRecipient[]>([]);

  protected readonly composeDraftInput = signal('');

  protected readonly composeSubject = signal('');

  protected readonly composeBody = signal('');

  protected readonly composeImportance = signal<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  protected readonly composeSending = signal(false);

  protected readonly composeError = signal<string | null>(null);

  protected readonly composeAttachments = signal<
    {
      id: string;
      filename: string;
      url: string;
      mimetype: string;
      size: number;
      loading: boolean;
    }[]
  >([]);

  protected readonly listLoading = signal(false);

  protected readonly listError = signal<string | null>(null);

  protected readonly directoryUsers = signal<ErpUserPublic[]>([]);

  protected readonly directoryLoading = signal(false);

  protected readonly deleteToolbarBusy = signal(false);

  protected readonly selectedMessageRow = computed((): ErpMessageRow | null => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }
    const f = this.folder();
    const rows = f === 'inbox' ? this.inboxRows() : this.sentRows();
    return rows.find((r) => r.id === id) ?? null;
  });

  protected readonly unreadInboxCount = computed(() =>
    this.inboxRows().filter((r) => !r.read).length,
  );

  protected readonly folders = computed(() => {
    const n = this.unreadInboxCount();
    return [
      {
        id: 'inbox' as const,
        label: 'Bandeja',
        icon: 'inbox',
        badge: n > 0 ? String(n) : undefined,
      },
      { id: 'sent' as const, label: 'Enviados', icon: 'send' },
    ];
  });

  protected readonly listTitle = computed(() => {
    const id = this.folder();
    return this.folders().find((f) => f.id === id)?.label ?? 'Bandeja';
  });

  protected readonly filteredMessages = computed((): ErpInboxMessageVm[] => {
    const f = this.folder();
    const rows = f === 'inbox' ? this.inboxRows() : this.sentRows();
    const q = this.searchQuery().trim().toLowerCase();
    let list = rows.map((r) => this.rowToVm(r, f));
    if (q) {
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q),
      );
    }
    return list;
  });

  protected readonly selected = computed((): ErpInboxMessageVm | null => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }
    return this.filteredMessages().find((m) => m.id === id) ?? null;
  });

  protected readonly readingAccentAttr = computed((): string | null => 'general');

  protected readonly composeSuggestions = computed((): MailboxContactSuggestion[] => {
    const q = this.composeDraftInput().trim().toLowerCase();
    const selfId = this.auth.session()?.userId;
    const chosenId = this.composeRecipients()[0]?.id;
    const users = this.directoryUsers().filter(
      (u) => u.activo && u.id !== selfId && u.id !== chosenId,
    );
    let list: MailboxContactSuggestion[] = users.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email ?? u.username,
      hint: u.puesto?.trim() || roleHint(u.role),
    }));
    if (!q) {
      return list.slice(0, 6);
    }
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
    return list.slice(0, 8);
  });

  constructor() {
    effect(() => {
      const f = this.folder();
      untracked(() => this.loadFolder(f));
    });

    effect(() => {
      const list = this.filteredMessages();
      const cur = this.selectedId();
      if (list.length === 0) {
        this.selectedId.set(null);
        return;
      }
      if (!cur || !list.some((m) => m.id === cur)) {
        this.selectedId.set(list[0].id);
      }
    });

    effect(() => {
      const id = this.selectedId();
      const f = this.folder();
      if (!id || f !== 'inbox') {
        return;
      }
      untracked(() => {
        const row = this.inboxRows().find((r) => r.id === id);
        if (!row || row.read) {
          return;
        }
        this.messagesApi.markRead(id).subscribe({
          next: (updated) => {
            this.inboxRows.update((list) =>
              list.map((m) => (m.id === id ? updated : m)),
            );
          },
          error: () => undefined,
        });
      });
    });

    effect((onCleanup) => {
      if (this.composeOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      onCleanup(() => {
        document.body.style.overflow = '';
      });
    });
  }

  private rowToVm(row: ErpMessageRow, folder: InboxFolderId): ErpInboxMessageVm {
    const counterpart = folder === 'inbox' ? row.sender : row.recipient;
    const { timeLabel, timeDetail } = formatMessageTimes(row.createdAt);
    return {
      id: row.id,
      from: counterpart.fullName,
      fromEmail: counterpart.email,
      timeLabel,
      timeDetail,
      subject: row.subject,
      preview: previewFromBody(row.body),
      read: folder === 'inbox' ? row.read : true,
      bodyParagraphs: bodyToParagraphs(row.body),
      importance: row.importance ?? 'LOW',
      attachments: (row.attachments || []).map((a) => ({
        ...a,
        url: `${apiBaseUrl}/messages/attachments/${a.id}/download`,
        previewUrl: a.url.startsWith('http') ? a.url : `${apiBaseUrl.split('/api')[0]}${a.url.startsWith('/') ? '' : '/'}${a.url}`,
        isImage: a.mimetype.startsWith('image/'),
      })),
    };
  }

  private loadFolder(folder: InboxFolderId): void {
    this.listLoading.set(true);
    this.listError.set(null);
    this.messagesApi.list(folder).subscribe({
      next: (rows) => {
        if (folder === 'inbox') {
          this.inboxRows.set(rows);
        } else {
          this.sentRows.set(rows);
        }
        this.listLoading.set(false);
      },
      error: () => {
        this.listLoading.set(false);
        this.listError.set('No se pudieron cargar los mensajes.');
      },
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscapeCloseCompose(): void {
    if (this.composeOpen()) {
      this.closeCompose();
    }
  }

  protected setFolder(id: InboxFolderId): void {
    this.folder.set(id);
    this.mobilePane.set('list');
  }

  protected onSearchInput(ev: Event): void {
    const v = ev.target;
    if (v instanceof HTMLInputElement) {
      this.searchQuery.set(v.value);
    }
  }

  protected selectMessage(id: string): void {
    this.selectedId.set(id);
    this.mobilePane.set('reader');
  }

  protected backToList(): void {
    this.mobilePane.set('list');
  }

  protected onCompose(): void {
    this.composePanelTitle.set('Nuevo mensaje');
    this.composeRecipients.set([]);
    this.composeDraftInput.set('');
    this.composeSubject.set('');
    this.composeBody.set('');
    this.composeImportance.set('LOW');
    this.composeAttachments.set([]);
    this.composeError.set(null);
    this.composeOpen.set(true);
    this.loadDirectoryIfNeeded();
  }

  private referenceBlock(row: ErpMessageRow, folder: InboxFolderId): string {
    const { timeDetail } = formatMessageTimes(row.createdAt);
    const who =
      folder === 'inbox'
        ? `De: ${row.sender.fullName}` +
          (row.sender.email ? ` <${row.sender.email}>` : '')
        : `Para: ${row.recipient.fullName}` +
          (row.recipient.email ? ` <${row.recipient.email}>` : '');
    return `---------- Mensaje referenciado ----------\n${who}\nFecha: ${timeDetail}\nAsunto: ${row.subject}\n\n${row.body}`;
  }

  private openComposeReply(row: ErpMessageRow): void {
    const f = this.folder();
    const to = f === 'inbox' ? row.sender : row.recipient;
    this.composePanelTitle.set('Responder');
    this.composeRecipients.set([participantToChip(to)]);
    this.composeDraftInput.set('');
    this.composeSubject.set(replySubjectLine(row.subject));
    this.composeBody.set(`\n\n${this.referenceBlock(row, f)}`);
    this.composeImportance.set('LOW');
    this.composeError.set(null);
    this.composeOpen.set(true);
    this.loadDirectoryIfNeeded();
  }

  private openComposeForward(row: ErpMessageRow): void {
    const f = this.folder();
    this.composePanelTitle.set('Reenviar');
    this.composeRecipients.set([]);
    this.composeDraftInput.set('');
    this.composeSubject.set(forwardSubjectLine(row.subject));
    this.composeBody.set(`\n\n${this.referenceBlock(row, f)}`);
    this.composeImportance.set('LOW');
    this.composeError.set(null);
    this.composeOpen.set(true);
    this.loadDirectoryIfNeeded();
  }

  private loadDirectoryIfNeeded(): void {
    if (this.directoryUsers().length > 0 || this.directoryLoading()) {
      return;
    }
    this.directoryLoading.set(true);
    this.messagesApi.listRecipients().subscribe({
      next: (users) => {
        this.directoryUsers.set(users);
        this.directoryLoading.set(false);
      },
      error: () => {
        this.directoryLoading.set(false);
        this.composeError.set('No se pudo cargar el listado de usuarios.');
      },
    });
  }

  protected closeCompose(): void {
    this.composeOpen.set(false);
  }

  protected onComposeDraftInput(ev: Event): void {
    const t = ev.target;
    if (t instanceof HTMLInputElement) {
      this.composeDraftInput.set(t.value);
    }
  }

  protected onComposeSubjectInput(ev: Event): void {
    const t = ev.target;
    if (t instanceof HTMLInputElement) {
      this.composeSubject.set(t.value);
    }
  }

  protected onComposeBodyInput(ev: Event): void {
    const t = ev.target;
    if (t instanceof HTMLTextAreaElement) {
      this.composeBody.set(t.value);
    }
  }

  protected onComposeDraftKeydown(ev: KeyboardEvent): void {
    const input = ev.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    if (ev.key === 'Enter' || ev.key === ',') {
      ev.preventDefault();
      this.commitDraftRecipient();
      return;
    }
    if (ev.key === 'Backspace' && !input.value) {
      this.composeRecipients.set([]);
    }
  }

  protected commitDraftRecipient(): void {
    const raw = this.composeDraftInput().trim().replace(/,$/, '');
    if (!raw) {
      return;
    }
    const selfId = this.auth.session()?.userId;
    const lower = raw.toLowerCase();
    const users = this.directoryUsers().filter((u) => u.activo && u.id !== selfId);
    const matches = users.filter(
      (u) =>
        u.fullName.toLowerCase() === lower ||
        u.username.toLowerCase() === lower ||
        (u.email?.toLowerCase() ?? '') === lower,
    );
    if (matches.length === 1) {
      const u = matches[0];
      this.composeRecipients.set([
        { id: u.id, name: u.fullName, email: u.email ?? u.username },
      ]);
      this.composeDraftInput.set('');
      return;
    }
    this.composeDraftInput.set('');
  }

  protected pickComposeSuggestion(c: MailboxContactSuggestion): void {
    this.composeRecipients.set([{ id: c.id, name: c.name, email: c.email }]);
    this.composeDraftInput.set('');
  }

  protected removeComposeRecipient(_id: string): void {
    this.composeRecipients.set([]);
  }

  protected onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const files = Array.from(input.files);
    files.forEach((file) => {
      // Validar tipo (solo imágenes y PDF)
      const allowed = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];
      if (!allowed.includes(file.type)) {
        this.composeError.set(`Tipo de archivo no permitido: ${file.name}`);
        return;
      }
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.composeError.set(`Archivo demasiado grande (máx 10MB): ${file.name}`);
        return;
      }

      const tempId = Math.random().toString(36).substring(7);
      
      // Crear una URL local temporal si es imagen para feedback inmediato
      let localPreview = '';
      if (file.type.startsWith('image/')) {
        localPreview = URL.createObjectURL(file);
      }

      this.composeAttachments.update((list) => [
        ...list,
        {
          id: tempId,
          filename: file.name,
          url: localPreview,
          mimetype: file.type,
          size: file.size,
          loading: true,
        },
      ]);

      this.messagesApi.uploadAttachment(file).subscribe({
        next: (res) => {
          // Si creamos un objeto URL, debemos revocarlo después, pero por ahora lo reemplazamos
          const fullUrl = res.url.startsWith('http') ? res.url : `${apiBaseUrl.split('/api')[0]}${res.url.startsWith('/') ? '' : '/'}${res.url}`;
          this.composeAttachments.update((list) =>
            list.map((a) => (a.id === tempId ? { ...res, url: fullUrl, loading: false } : a)),
          );
        },
        error: () => {
          this.composeAttachments.update((list) =>
            list.filter((a) => a.id !== tempId),
          );
          this.composeError.set(`Error al subir ${file.name}`);
        },
      });
    });
    // Limpiar input para permitir seleccionar el mismo archivo si se desea
    input.value = '';
  }

  protected removeAttachment(id: string): void {
    this.composeAttachments.update((list) => list.filter((a) => a.id !== id));
  }

  protected isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  protected formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  protected isAnyAttachmentLoading(): boolean {
    return this.composeAttachments().some((a) => a.loading);
  }

  protected onFormattingAction(type: 'bold'): void {
    if (type === 'bold') {
      const current = this.composeBody();
      this.composeBody.set(current + ' **texto** ');
    }
  }

  protected onComposeSend(): void {
    const rs = this.composeRecipients();
    if (rs.length !== 1) {
      return;
    }
    const subj = this.composeSubject().trim();
    const bod = this.composeBody().trim();
    if (!subj || !bod) {
      return;
    }
    this.composeSending.set(true);
    this.composeError.set(null);

    const attachmentIds = this.composeAttachments()
      .filter((a) => !a.loading)
      .map((a) => a.id);

    this.messagesApi
      .create({
        recipientId: rs[0].id,
        subject: subj,
        body: bod,
        importance: this.composeImportance(),
        attachmentIds,
      })
      .subscribe({
        next: (row) => {
          this.composeSending.set(false);
          this.composeBody.set('');
          this.composeSubject.set('');
          this.composeAttachments.set([]);
          this.composeRecipients.set([]);
          this.closeCompose();
          this.sentRows.update((list) => {
            if (list.some((m) => m.id === row.id)) {
              return list;
            }
            return [row, ...list];
          });
          this.folder.set('sent');
          this.selectedId.set(row.id);
          this.mobilePane.set('reader');
          this.loadFolder('inbox');
        },
        error: (err: { error?: { message?: string | string[] } }) => {
          this.composeSending.set(false);
          const msg = err?.error?.message;
          const text = Array.isArray(msg) ? msg[0] : msg;
          this.composeError.set(
            typeof text === 'string' ? text : 'No se pudo enviar el mensaje.',
          );
        },
      });
  }

  protected onToolbarAction(action: 'reply' | 'forward' | 'close' | 'delete'): void {
    const row = this.selectedMessageRow();
    if (!row) {
      return;
    }
    if (action === 'reply') {
      this.openComposeReply(row);
      return;
    }
    if (action === 'forward') {
      this.openComposeForward(row);
      return;
    }
    if (action === 'close') {
      if (this.folder() === 'inbox' && !row.read) {
        this.messagesApi.markRead(row.id).subscribe({
          next: (updated) => {
            this.inboxRows.update((list) =>
              list.map((m) => (m.id === row.id ? updated : m)),
            );
          },
          error: () => undefined,
        });
      }
      return;
    }
    if (action === 'delete') {
      if (
        !globalThis.confirm(
          '¿Quitar este mensaje de tu bandeja? El otro usuario conserva su copia.',
        )
      ) {
        return;
      }
      this.deleteToolbarBusy.set(true);
      this.messagesApi.archive(row.id).subscribe({
        next: () => {
          this.deleteToolbarBusy.set(false);
          const f = this.folder();
          if (f === 'inbox') {
            this.inboxRows.update((list) => list.filter((m) => m.id !== row.id));
          } else {
            this.sentRows.update((list) => list.filter((m) => m.id !== row.id));
          }
          this.loadFolder(f);
        },
        error: () => {
          this.deleteToolbarBusy.set(false);
        },
      });
    }
  }

  protected onSendReply(): void {
    const current = this.selected();
    if (!current) return;

    const body = this.composeBody().trim();
    if (!body) return;

    this.composeSending.set(true);
    this.composeError.set(null);

    const attachmentIds = this.composeAttachments()
      .filter((a) => !a.loading)
      .map((a) => a.id);

    // Buscamos el ID real del destinatario (el sender del mensaje original si estamos en inbox)
    const row = this.selectedMessageRow();
    if (!row) return;
    
    // Si estamos en Inbox, el destinatario de nuestra respuesta es el sender.
    // Si estamos en Sent, el destinatario es el recipient original.
    const recipientId = this.folder() === 'inbox' ? row.sender.id : row.recipient.id;

    this.messagesApi
      .create({
        recipientId,
        subject: `Re: ${current.subject}`.replace(/^Re: Re:/i, 'Re:'),
        body,
        importance: current.importance,
        attachmentIds,
      })
      .subscribe({
        next: (row) => {
          this.composeSending.set(false);
          this.composeBody.set('');
          this.composeAttachments.set([]);
          
          // Actualizar lista de enviados y navegar a ella para ver la respuesta
          this.sentRows.update((list) => [row, ...list]);
          this.folder.set('sent');
          this.selectedId.set(row.id);
          this.mobilePane.set('reader');
          this.loadFolder('inbox');
        },
        error: (err) => {
          this.composeSending.set(false);
          this.composeError.set('No se pudo enviar la respuesta.');
        },
      });
  }

  protected messageAccent(m: ErpInboxMessageVm): string {
    return m.importance.toLowerCase();
  }

  protected composeSendDisabled(): boolean {
    return (
      this.composeRecipients().length !== 1 ||
      !this.composeSubject().trim() ||
      !this.composeBody().trim() ||
      this.composeSending()
    );
  }

  protected onDownloadAttachment(a: ErpInboxMessageVm['attachments'][0], ev: Event): void {
    ev.preventDefault();
    this.messagesApi.downloadAttachment(a.id).subscribe({
      next: (res) => {
        // Abrimos la URL firmada en una nueva pestaña para iniciar la descarga
        window.open(res.url, '_blank');
      },
      error: () => {
        alert('No se pudo descargar el archivo.');
      },
    });
  }
}
