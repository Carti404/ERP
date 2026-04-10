import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../environment';

export interface AttendanceLog {
  id: string;
  eventType: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END' | 'MEAL_START' | 'MEAL_END';
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  workDate: string;
  status: string;
  logs: AttendanceLog[];
  message?: string;
}

export interface RegisterEventResponse {
  message: string;
  recordId: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${apiBaseUrl}/attendance`;

  getTodayStatus(): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.baseUrl}/today`);
  }

  getMyHistory(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/me`);
  }

  registerEvent(eventType: string): Observable<RegisterEventResponse> {
    return this.http.post<RegisterEventResponse>(`${this.baseUrl}/event`, { eventType });
  }

  getMatrixData(startDate: string, endDate: string): Observable<AttendanceMatrixResponse> {
    return this.http.get<AttendanceMatrixResponse>(`${this.baseUrl}/matrix`, {
      params: { startDate, endDate }
    });
  }
}

export interface AttendanceMatrixResponse {
  workers: Array<{
    id: string;
    fullName: string;
    puesto: string;
  }>;
  matrix: Record<string, Record<string, {
    id: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
  }>>;
  startDate: string;
  endDate: string;
}
