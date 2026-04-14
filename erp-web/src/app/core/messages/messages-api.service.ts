import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiBaseUrl } from '../environment';
import type { ErpUserPublic } from '../users/users-api.types';
import type {
  CreateMessagePayload,
  ErpMessageAttachment,
  ErpMessageFolder,
  ErpMessageRow,
} from './messages-api.types';

@Injectable({ providedIn: 'root' })
export class MessagesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = apiBaseUrl;

  /** Usuarios activos para redactar mensajes (mismo DTO que listado admin). */
  listRecipients(): Observable<ErpUserPublic[]> {
    return this.http.get<ErpUserPublic[]>(`${this.base}/messages/recipients`);
  }

  list(folder: ErpMessageFolder): Observable<ErpMessageRow[]> {
    return this.http.get<ErpMessageRow[]>(`${this.base}/messages`, {
      params: { folder },
    });
  }

  create(body: CreateMessagePayload): Observable<ErpMessageRow> {
    return this.http.post<ErpMessageRow>(`${this.base}/messages`, body);
  }

  markRead(id: string): Observable<ErpMessageRow> {
    return this.http.patch<ErpMessageRow>(`${this.base}/messages/${id}/read`, {});
  }

  /** Quita el mensaje de la bandeja del usuario (enviados o entrada). */
  archive(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/messages/${id}`);
  }

  uploadAttachment(file: File): Observable<ErpMessageAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ErpMessageAttachment>(
      `${this.base}/messages/attachments/upload`,
      formData,
    );
  }

  downloadAttachment(id: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.base}/messages/attachments/${id}/download`);
  }

  downloadByUrl(url: string, filename?: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.base}/messages/attachments/download-evidence`, {
      params: { url, filename: filename || '' },
    });
  }
}
