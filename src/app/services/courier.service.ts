import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  CourierApiResponse,
  CourierAssignedOrder
} from '../models/courier-assigned-order.model';

@Injectable({ providedIn: 'root' })
export class CourierService {
  // Uses the Angular dev proxy in src/proxy.conf.json, just like the other services.
  private readonly apiUrl = '/api/courier/orders';

  constructor(private readonly http: HttpClient) {}

  getAssignedOrders(): Observable<CourierAssignedOrder[]> {
    return this.http.get<CourierAssignedOrder[] | CourierApiResponse<CourierAssignedOrder[]>>(
      this.apiUrl,
      { headers: this.authHeaders() }
    ).pipe(
      map((response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.orders)) return response.orders;
        return [];
      })
    );
  }

  acceptAssignment(orderId: number): Observable<unknown> {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/accept`,
      {},
      { headers: this.authHeaders() }
    );
  }

  declineAssignment(orderId: number): Observable<unknown> {
    return this.http.patch(
      `${this.apiUrl}/${orderId}/decline`,
      {},
      { headers: this.authHeaders() }
    );
  }

  private authHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
  }
}
