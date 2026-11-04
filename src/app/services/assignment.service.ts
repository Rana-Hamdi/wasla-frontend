import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourierAssignment } from '../models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly apiUrl = 'http://localhost:8080/api/assignments';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = sessionStorage.getItem('token');
    return { Authorization: `Bearer ${token ?? ''}` };
  }

  getAll(): Observable<CourierAssignment[] | null> {
    return this.http.get<CourierAssignment[] | null>(this.apiUrl, {
      headers: this.authHeaders()
    });
  }

  assign(orderId: number, courierId: number, adminId: number): Observable<void> {
    return this.http.post<void>(this.apiUrl, {
      order_id: orderId,
      courier_id: courierId,
      assigned_by: adminId
    }, { headers: this.authHeaders() });
  }

  reassign(orderId: number, newCourierId: number, adminId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reassign`, {
      order_id: orderId,
      new_courier_id: newCourierId,
      assigned_by: adminId
    }, { headers: this.authHeaders() });
  }
}
