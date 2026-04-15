import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../environment';

export interface AdminKpis {
  mermas: {
    count: number;
    label: string;
  };
  asistencia: {
    percentage: number;
    label: string;
  };
  cierres: {
    count: number;
    label: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${apiBaseUrl}/dashboard`;

  getAdminKpis(): Observable<AdminKpis> {
    return this.http.get<AdminKpis>(`${this.apiUrl}/admin-kpis`);
  }
}
