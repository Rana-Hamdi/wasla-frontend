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
        return this.http.get<Order[]>(this.apiUrl);
    }

    // get order by id
    getOrderById(id: number) : Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`)
    }

    // update order status
    updateOrderStatus(id: number, status: string) : Observable<{message:string}> {
        return this.http.put<{message:string}>(`${this.apiUrl}/${id}`, {status: status})
    }

    // delete order
    deleteOrder(id: number) : Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
    }

}