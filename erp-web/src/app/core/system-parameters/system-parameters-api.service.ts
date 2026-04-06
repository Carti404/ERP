import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiBaseUrl } from '../environment';
import type { PutSystemParametersPayload, SystemParametersSnapshot } from './system-parameters-api.types';

@Injectable({ providedIn: 'root' })
export class SystemParametersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = apiBaseUrl;

  get(): Observable<SystemParametersSnapshot> {
    return this.http.get<SystemParametersSnapshot>(
      `${this.base}/system-parameters`,
    );
  }

  put(body: PutSystemParametersPayload): Observable<SystemParametersSnapshot> {
    return this.http.put<SystemParametersSnapshot>(
      `${this.base}/system-parameters`,
      body,
    );
  }
}
