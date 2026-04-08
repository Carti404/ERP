import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../environment';

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
}

@Injectable({
  providedIn: 'root',
})
export class ProductionService {
  private readonly http = inject(HttpClient);

  getPendingProduction(): Observable<ProductionTask[]> {
    return this.http.get<ProductionTask[]>(`${apiBaseUrl}/production`);
  }
}

