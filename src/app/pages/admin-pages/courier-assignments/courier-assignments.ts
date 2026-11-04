import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AssignmentService } from '../../../services/assignment.service';
import { OrderService } from '../../../services/order.service';
import { CourierAssignment } from '../../../models/assignment.model';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-courier-assignments',
  imports: [FormsModule, DatePipe],
  templateUrl: './courier-assignments.html',
  styleUrl: './courier-assignments.css'
})
export class CourierAssignments implements OnInit {
  assignments = signal<CourierAssignment[]>([]);
  orders = signal<Order[]>([]);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  search = signal('');
  statusFilter = signal('all');

  showForm = false;
  formMode: 'assign' | 'reassign' = 'assign';
  formOrderId: number | null = null;
  formCourierId: number | null = null;
  formError = '';

  filteredAssignments = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.assignments().filter(a => {
      const matchesStatus = this.statusFilter() === 'all' || a.status === this.statusFilter();
      const matchesSearch = !q || String(a.id).includes(q) ||
        String(a.order_id).includes(q) || String(a.courier_id).includes(q) ||
        (this.orderFor(a.order_id)?.tracking_number ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  });

  activeAssignments = computed(() => this.assignments().filter(a => a.status === 'pending' || a.status === 'accepted'));
  pendingOrders = computed(() => this.orders().filter(o => o.status === 'pending'));

  constructor(
    private assignmentService: AssignmentService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    forkJoin({
      assignments: this.assignmentService.getAll(),
      orders: this.orderService.getAllOrders()
    }).subscribe({
      next: ({ assignments, orders }) => {
        this.assignments.set((assignments ?? []).slice().sort((a, b) => b.id - a.id));
        this.orders.set(orders ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load courier assignments:', err);
        this.errorMessage.set('Could not load assignments. Check your login and backend connection.');
        this.loading.set(false);
      }
    });
  }

  orderFor(orderId: number): Order | undefined {
    return this.orders().find(o => o.id === orderId);
  }

  openAssign(): void {
    this.formMode = 'assign';
    this.formOrderId = null;
    this.formCourierId = null;
    this.formError = '';
    this.showForm = true;
  }

  openReassign(a: CourierAssignment): void {
    this.formMode = 'reassign';
    this.formOrderId = a.order_id;
    this.formCourierId = null;
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    if (!this.saving()) this.showForm = false;
  }

  saveAssignment(): void {
    if (this.saving()) return;
    this.formError = '';
    const orderId = Number(this.formOrderId);
    const courierId = Number(this.formCourierId);
    // Login currently stores a token only; read the user ID from its verified JWT payload.
    // The backend must eventually derive assigned_by from the authenticated token instead.
    const adminId = this.loggedInUserId();

    if (!Number.isInteger(orderId) || orderId <= 0 || !Number.isInteger(courierId) || courierId <= 0) {
      this.formError = 'Please provide a valid order and courier ID.';
      return;
    }
    if (!adminId) {
      this.formError = 'Admin ID is unavailable. Please sign in again.';
      return;
    }
    if (this.formMode === 'assign' && !this.pendingOrders().some(o => o.id === orderId)) {
      this.formError = 'Select an order with Pending status.';
      return;
    }
    if (this.formMode === 'reassign') {
      const existing = this.activeAssignments().find(a => a.order_id === orderId);
      if (!existing) {
        this.formError = 'This order has no active assignment.';
        return;
      }
      if (existing.courier_id === courierId) {
        this.formError = 'Choose a different courier.';
        return;
      }
    }

    this.saving.set(true);
    const request = this.formMode === 'assign'
      ? this.assignmentService.assign(orderId, courierId, adminId)
      : this.assignmentService.reassign(orderId, courierId, adminId);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.showForm = false;
        this.successMessage.set(this.formMode === 'assign' ? 'Order assigned successfully.' : 'Order reassigned successfully.');
        this.loadData();
      },
      error: (err) => {
        console.error('Assignment failed:', err);
        this.formError = typeof err?.error === 'string' && err.error.trim()
          ? err.error.trim() : 'The operation failed. Verify the order, courier ID, and permissions.';
      }
    });
  }

  private loggedInUserId(): number | null {
    // Current Go login returns user_id but the Angular login only stores token.
    // Decode JWT subject for display/request compatibility; this is NOT authorization.
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return null;
      const payload = token.split('.')[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(atob(base64));
      const id = Number(data.sub);
      return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }
}
