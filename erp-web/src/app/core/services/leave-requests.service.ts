import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../environment';

export type LeaveRequestType = 'VACATION' | 'LATENESS' | 'ABSENCE' | 'PERSONAL' | 'MEDICAL';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADMIN_PROPOSAL';

export interface LeaveRequestHistory {
  id: string;
  actionType: string;
  message: string;
  proposedStartDate?: string;
  proposedEndDate?: string;
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
  };
}

export interface LeaveRequest {
  id: string;
  type: LeaveRequestType;
  status: LeaveRequestStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  evidenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
  };
  history?: LeaveRequestHistory[];
  segments?: Array<{ start: string, end: string, count: number }>;
}

export interface AdminLeaveStats {
  totalActiveWorkers: number;
  pendingRequests: number;
}

export interface LeaveBalance {
  fechaIngreso: string;
  totalAssigned: number;
  usedDays: number;
  availableDays: number;
}

@Injectable({ providedIn: 'root' })
export class LeaveRequestsService {
  private url = `${apiBaseUrl}/leave-requests`;

  constructor(private http: HttpClient) {}

  getBalance(): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.url}/balance`);
  }

  getMyRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.url}/me`);
  }

  getAllRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.url);
  }

  createRequest(payload: {
    type: 'VACATION' | 'ABSENCE';
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    evidenceUrl?: string;
    segments?: Array<{ start: string, end: string, count: number }>;
  }): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.url, payload);
  }

  getAdminStats(): Observable<AdminLeaveStats> {
    return this.http.get<AdminLeaveStats>(`${this.url}/admin/stats`);
  }

  updateStatus(
    id: string,
    payload: {
      status: LeaveRequestStatus;
      message?: string;
      proposedStartDate?: string;
      proposedEndDate?: string;
    }
  ): Observable<LeaveRequest> {
    return this.http.patch<LeaveRequest>(`${this.url}/${id}/status`, payload);
  }
}
