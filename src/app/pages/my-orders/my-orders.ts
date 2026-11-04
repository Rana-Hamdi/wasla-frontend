import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  imports: [FormsModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders {
  constructor(private cdr: ChangeDetectorRef) {}

  orders: any[] = [];

  search = '';
  selectedStatus = 'all';

  loading = true;
  error = '';

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {

    const token = sessionStorage.getItem('token');

    if (!token) {
      this.error = 'Please log in first.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();

      this.orders = Array.isArray(data) ? data : (data.orders || []);

    } catch {
      this.error = 'Could not load orders.';
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  filteredOrders() {

    return this.orders.filter(order => {

      const matchesSearch =
        order.tracking_number.toLowerCase().includes(this.search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(this.search.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'all' ||
        order.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });

  }

}