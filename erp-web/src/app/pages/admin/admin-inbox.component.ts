import { Component, HostListener, computed, effect, signal } from '@angular/core';

import {
  ADMIN_INBOX_FOLDERS,
  ADMIN_INBOX_MESSAGES,
  ADMIN_MAILBOX_CONTACT_SUGGESTIONS,
  type AdminInboxFolderId,
  type AdminInboxMessage,
  type AdminMailboxContactSuggestion,
} from './admin-inbox.mock';

interface MailboxComposeRecipient {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

@Component({
  selector: 'app-admin-inbox',
  standalone: true,
  templateUrl: './admin-inbox.component.html',
})
export class AdminInboxComponent {
  protected readonly folders = ADMIN_INBOX_FOLDERS;

  protected readonly folder = signal<AdminInboxFolderId>('inbox');

  protected readonly searchQuery = signal('');

  protected readonly selectedId = signal<string | null>('m4');

  protected readonly mobilePane = signal<'list' | 'reader'>('list');

  protected readonly composeOpen = signal(false);

  protected readonly composeRecipients = signal<MailboxComposeRecipient[]>([]);

  protected readonly composeDraftInput = signal('');

  protected readonly composeSubject = signal('');

  protected readonly composeBody = signal('');

  protected readonly listTitle = computed(() => {
    const id = this.folder();
    return this.folders.find((f) => f.id === id)?.label ?? 'Bandeja';
  });

  protected readonly filteredMessages = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const f = this.folder();
    let list = ADMIN_INBOX_MESSAGES.filter((m) => {
      if (f === 'critical') {
        return m.urgent === true;
      }
      return m.folder === f;
    });
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

  protected readonly selected = computed((): AdminInboxMessage | null => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }
    return ADMIN_INBOX_MESSAGES.find((m) => m.id === id) ?? null;
  });

  protected readonly readingAccentAttr = computed((): string | null => {
    const m = this.selected();
    return m ? (m.accent ?? 'general') : null;
  });

  protected readonly composeSuggestions = computed((): AdminMailboxContactSuggestion[] => {
    const q = this.composeDraftInput().trim().toLowerCase();
    const chosenEmails = new Set(
      this.composeRecipients()
        .map((r) => r.email.toLowerCase())
        .filter(Boolean),
    );
    const chosenIds = new Set(this.composeRecipients().map((r) => r.id));
    let list = ADMIN_MAILBOX_CONTACT_SUGGESTIONS.filter((c) => !chosenIds.has(c.id));
    if (!q) {
      return list.slice(0, 5);
    }
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    return list.filter((c) => !chosenEmails.has(c.email.toLowerCase())).slice(0, 6);
  });

  constructor() {
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

  @HostListener('document:keydown.escape')
  protected onEscapeCloseCompose(): void {
    if (this.composeOpen()) {
      this.closeCompose();
    }
  }

  protected setFolder(id: AdminInboxFolderId): void {
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
    this.composeRecipients.set([]);
    this.composeDraftInput.set('');
    this.composeSubject.set('');
    this.composeBody.set('');
    this.composeOpen.set(true);
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
      this.removeLastRecipient();
    }
  }

  protected commitDraftRecipient(): void {
    const raw = this.composeDraftInput().trim().replace(/,$/, '');
    if (!raw) {
      return;
    }
    const lower = raw.toLowerCase();
    const dup = this.composeRecipients().some(
      (r) => r.email.toLowerCase() === lower || r.name.toLowerCase() === lower,
    );
    if (dup) {
      this.composeDraftInput.set('');
      return;
    }
    const exact = ADMIN_MAILBOX_CONTACT_SUGGESTIONS.find(
      (c) => c.email.toLowerCase() === lower || c.name.toLowerCase() === lower,
    );
    if (exact) {
      this.composeRecipients.update((rs) => [...rs, { id: exact.id, name: exact.name, email: exact.email }]);
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
      this.composeRecipients.update((rs) => [
        ...rs,
        { id: `free-${Date.now()}`, name: raw, email: isEmail ? raw : '' },
      ]);
    }
    this.composeDraftInput.set('');
  }

  protected pickComposeSuggestion(c: AdminMailboxContactSuggestion): void {
    if (this.composeRecipients().some((r) => r.id === c.id || r.email.toLowerCase() === c.email.toLowerCase())) {
      return;
    }
    this.composeRecipients.update((rs) => [...rs, { id: c.id, name: c.name, email: c.email }]);
    this.composeDraftInput.set('');
  }

  protected removeComposeRecipient(id: string): void {
    this.composeRecipients.update((rs) => rs.filter((r) => r.id !== id));
  }

  protected removeLastRecipient(): void {
    const rs = this.composeRecipients();
    if (rs.length === 0) {
      return;
    }
    this.composeRecipients.set(rs.slice(0, -1));
  }

  protected onComposeSend(): void {
    if (this.composeRecipients().length === 0) {
      return;
    }
    this.closeCompose();
  }

  protected onToolbarAction(_action: 'reply' | 'forward' | 'close' | 'delete'): void {
    return;
  }

  protected onSendReply(): void {
    return;
  }

  protected attachmentIcon(kind: 'image' | 'pdf' | 'other'): string {
    if (kind === 'image') {
      return 'image';
    }
    if (kind === 'pdf') {
      return 'description';
    }
    return 'attach_file';
  }

  protected messageAccent(m: AdminInboxMessage): string {
    return m.accent ?? 'general';
  }
}
