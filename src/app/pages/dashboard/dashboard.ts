import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private cdr: ChangeDetectorRef) {}

  orders: any[] = [];

  async ngOnInit() {
    const token = sessionStorage.getItem('token');

    if (!token) return;

    try {
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      this.orders = await response.json();
      this.cdr.markForCheck();

    } catch (error) {
      console.error('Could not load orders:', error);
    }
  }

  recentOrders() {
    return [...this.orders]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5);
  }

  countStatus(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }

  totalCOD(): number {
    return this.orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + Number(order.cod_amount), 0);
  }
   logout() {
    sessionStorage.removeItem('token');
  }
}
  
