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

export interface AttendanceSummaryDay {
  day: number;
  kind: 'ok' | 'warning' | 'critical' | 'weekend' | 'muted';
  isPadding?: boolean;
}

export interface AttendanceSummaryResponse {
  title: string;
  days: AttendanceSummaryDay[];
}

export interface AssignedOrder {
  id: string;
  orderNumber: string;
  productName: string;
  status: string;
  workers: string[];
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

  getAttendanceSummary(): Observable<AttendanceSummaryResponse> {
    return this.http.get<AttendanceSummaryResponse>(`${this.apiUrl}/attendance-summary`);
  }

  getAssignedOrders(): Observable<AssignedOrder[]> {
    return this.http.get<AssignedOrder[]>(`${this.apiUrl}/assigned-orders`);
  }
}
