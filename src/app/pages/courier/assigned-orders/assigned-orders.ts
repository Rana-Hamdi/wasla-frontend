import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { CourierService } from '../../../services/courier.service';
import { CourierAssignedOrder } from '../../../models/courier-assigned-order.model';

@Component({
  selector: 'app-assigned-orders',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './assigned-orders.html',
  styleUrl: './assigned-orders.css'
})
export class AssignedOrdersComponent implements OnInit {

  orders: CourierAssignedOrder[] = [];

  loading = false;
  actionLoadingId: number | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(
    private courierService: CourierService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.courierService.getAssignedOrders().subscribe({
      next: (orders) => {
          console.log('Assigned orders:', orders);

        this.orders = orders;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to load assigned orders.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getOrderId(order: CourierAssignedOrder): number | null {
    return order.id ?? order.order_id ?? null;
  }

  get pendingCount(): number {
    return this.orders.filter(
      order => order.assignment_status === 'pending'
    ).length;
  }

  get acceptedCount(): number {
    return this.orders.filter(
      order => order.assignment_status === 'accepted'
    ).length;
  }

  acceptOrder(order: CourierAssignedOrder): void {
    const orderId = this.getOrderId(order);

    if (orderId === null) {
      this.errorMessage = 'Order ID is missing.';
      return;
    }

    this.actionLoadingId = orderId;
    this.errorMessage = '';
    this.successMessage = '';

    this.courierService.acceptAssignment(orderId).subscribe({
      next: () => {
        this.successMessage = 'Order accepted successfully.';
        this.actionLoadingId = null;
        this.cdr.markForCheck();
        this.loadOrders();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Could not accept this order.';
        this.actionLoadingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  declineOrder(order: CourierAssignedOrder): void {
    const orderId = this.getOrderId(order);

    if (orderId === null) {
      this.errorMessage = 'Order ID is missing.';
      return;
    }

    if (!window.confirm('Are you sure you want to decline this order?')) {
      return;
    }

    this.actionLoadingId = orderId;
    this.errorMessage = '';
    this.successMessage = '';

    this.courierService.declineAssignment(orderId).subscribe({
      next: () => {
        this.successMessage = 'Order declined successfully.';
        this.actionLoadingId = null;
        this.cdr.markForCheck();
        this.loadOrders();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Could not decline this order.';
        this.actionLoadingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  openUpdateStatus(order: CourierAssignedOrder): void {
    const orderId = this.getOrderId(order);

    if (orderId === null) {
      this.errorMessage = 'Order ID is missing.';
      return;
    }

    this.router.navigate(['/courier/update-status', orderId]);
  }
  continueDelivery(order: CourierAssignedOrder): void {
    this.openUpdateStatus(order);
  }

  callCustomer(phone?: string): void {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }

  formatStatus(status?: string): string {
    if (!status) return 'Not available';

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  getShipmentStatus(order: CourierAssignedOrder): string {
    return order.order_status || order.status || 'Not available';
  };
}