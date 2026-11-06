import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Order } from "../models/order.model";

@Injectable({
    providedIn: 'root'
})

export class OrderService {
    private apiUrl = 'http://localhost:8080/api/orders';

    constructor(private http: HttpClient) {}

    // get all orders
    getAllOrders(): Observable<Order[]> {
        const token = sessionStorage.getItem('token');

        return this.http.get<Order[]>(this.apiUrl, {
            headers: {Authorization: `Bearer ${token}`}
        });
    }

    // get order by id
    getOrderById(id: number) : Observable<Order> {
        const token = sessionStorage.getItem('token');
        return this.http.get<Order>(`${this.apiUrl}/${id}`, {
            headers: {Authorization: `Bearer ${token}`}
        });
    }

    // update order status
    updateOrderStatus(id: number, status: string) : Observable<{message:string}> {
        const token = sessionStorage.getItem('token');
        return this.http.put<{message:string}>(`${this.apiUrl}/${id}`, {status: status}, { headers: { Authorization: `Bearer ${token}`}})
    }

    // delete order
    deleteOrder(id: number) : Observable<void> {
        const token = sessionStorage.getItem('token');
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: { Authorization: `Bearer ${token}`}});
    }

}