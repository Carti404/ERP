import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiBaseUrl } from '../environment';
import type {
  CreateUserPayload,
  ErpUserPublic,
  UpdateUserPayload,
} from './users-api.types';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = apiBaseUrl;

  list(): Observable<ErpUserPublic[]> {
    return this.http.get<ErpUserPublic[]>(`${this.base}/users`);
  }

  create(body: CreateUserPayload): Observable<ErpUserPublic> {
    return this.http.post<ErpUserPublic>(`${this.base}/users`, body);
  }

  update(id: string, body: UpdateUserPayload): Observable<ErpUserPublic> {
    return this.http.patch<ErpUserPublic>(`${this.base}/users/${id}`, body);
  }

  deactivate(id: string): Observable<ErpUserPublic> {
    return this.http.patch<ErpUserPublic>(
      `${this.base}/users/${id}/deactivate`,
      {},
    );
  }

  reactivate(id: string): Observable<ErpUserPublic> {
    return this.http.patch<ErpUserPublic>(
      `${this.base}/users/${id}/reactivate`,
      {},
    );
  }
}
