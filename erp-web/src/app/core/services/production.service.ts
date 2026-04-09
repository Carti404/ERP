import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../environment';

export interface ProductionProcess {
  id: string;
  taskId: string;
  orderIndex: number;
  name: string;
  description: string;
  estimatedTimeValue: number;
  estimatedTimeUnit: string; // 'minutes', 'hours', 'days', 'weeks'
}

export interface ProcessTracking {
  id: string;
  assignmentId: string;
  processId: string;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  process?: ProductionProcess;
}

export interface WasteReport {
  id: string;
  assignmentId: string;
  productId: string;
  productName: string;
  itemType: string;
  quantity: number;
  unitOfMeasure: string;
  notes: string;
  createdAt: string;
  assignment?: ProductionAssignment;
}

export interface ProductionAssignment {
  id: string;
  taskId: string;
  workerId: string;
  quantity: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  task?: ProductionTask;
  worker?: any;
  processTracking?: ProcessTracking[];
  wasteReports?: WasteReport[];
}

export interface ProductionTask {
  id: string;
  externalMtId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantityToProduce: number;
  recipe: any;
  status: string;
  createdAt: string;
  assignments?: ProductionAssignment[];
  processes?: ProductionProcess[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductionService {
  private readonly http = inject(HttpClient);

  // ──── Tareas ────

  getPendingProduction(): Observable<ProductionTask[]> {
    return this.http.get<ProductionTask[]>(`${apiBaseUrl}/production`);
  }

  getProductionTask(id: string): Observable<ProductionTask> {
    return this.http.get<ProductionTask>(`${apiBaseUrl}/production/${id}`);
  }

  getMtProduceableProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${apiBaseUrl}/production/mt-products`);
  }

  // ──── Asignaciones ────

  assignTask(taskId: string, assignments: { workerId: string; quantity: number }[]): Observable<any> {
    return this.http.post(`${apiBaseUrl}/production/${taskId}/assign`, { assignments });
  }

  getMyAssignments(): Observable<ProductionAssignment[]> {
    return this.http.get<ProductionAssignment[]>(`${apiBaseUrl}/production/my-assignments`);
  }

  updateAssignmentStatus(assignmentId: string, status: string): Observable<any> {
    return this.http.patch(`${apiBaseUrl}/production/assignments/${assignmentId}/status`, { status });
  }

  unassignTask(taskId: string): Observable<any> {
    return this.http.delete(`${apiBaseUrl}/production/${taskId}/assign`);
  }

  // ──── Procesos (Admin) ────

  getProcesses(taskId: string): Observable<ProductionProcess[]> {
    return this.http.get<ProductionProcess[]>(`${apiBaseUrl}/production/${taskId}/processes`);
  }

  setProcesses(taskId: string, processes: Omit<ProductionProcess, 'id' | 'taskId'>[]): Observable<ProductionProcess[]> {
    return this.http.post<ProductionProcess[]>(`${apiBaseUrl}/production/${taskId}/processes`, { processes });
  }

  // ──── Tracking de Procesos (Trabajador) ────

  getTracking(assignmentId: string): Observable<ProcessTracking[]> {
    return this.http.get<ProcessTracking[]>(`${apiBaseUrl}/production/assignments/${assignmentId}/tracking`);
  }

  startProcess(assignmentId: string, processId: string): Observable<ProcessTracking> {
    return this.http.post<ProcessTracking>(`${apiBaseUrl}/production/assignments/${assignmentId}/processes/${processId}/start`, {});
  }

  completeProcess(assignmentId: string, processId: string): Observable<ProcessTracking> {
    return this.http.post<ProcessTracking>(`${apiBaseUrl}/production/assignments/${assignmentId}/processes/${processId}/complete`, {});
  }

  // ──── Mermas y Finalización ────

  reportWaste(assignmentId: string, items: { productId?: string; productName: string; itemType?: string; quantity: number; unitOfMeasure?: string; notes?: string }[]): Observable<any> {
    return this.http.post(`${apiBaseUrl}/production/assignments/${assignmentId}/waste`, { items });
  }

  completeAssignment(assignmentId: string): Observable<any> {
    return this.http.post(`${apiBaseUrl}/production/assignments/${assignmentId}/complete`, {});
  }

  // ──── Mermas (Admin) ────

  getAllWaste(): Observable<WasteReport[]> {
    return this.http.get<WasteReport[]>(`${apiBaseUrl}/production/waste`);
  }

  // ──── Reportar a Mundo Terapeuta ────

  reportToMT(taskId: string): Observable<any> {
    return this.http.post(`${apiBaseUrl}/production/${taskId}/report-to-mt`, {});
  }
}
