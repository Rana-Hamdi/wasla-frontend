import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-manage-orders',
  imports: [RouterLink],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css'
})
export class ManageOrders implements OnInit {
  orders = signal<Order[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  searchText = signal('');
  selectedStatus = signal('all');
  selectedGovernorate = signal('all');
  currentPage = signal(1);
  pageSize = 5;
  busyOrderId = signal<number | null>(null);
  notice = signal('');

  statuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
  governorates = ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Qalyubia', 'Sharqia', 'Gharbia', 'Monufia', 'Beheira', 'Fayoum', 'Beni Suef', 'Minya', 'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Port Said', 'Suez', 'Ismailia', 'Damietta', 'Kafr El Sheikh', 'Matrouh', 'Red Sea', 'North Sinai', 'South Sinai', 'New Valley'];

  filteredOrders = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    return this.orders().filter(order => {
      const text = [order.tracking_number, order.customer_name, order.customer_phone, order.pickup_address, order.dropoff_address]
        .map(value => String(value ?? '').toLowerCase()).join(' ');
      const matchesSearch = !search || text.includes(search);
      const matchesStatus = this.selectedStatus() === 'all' || order.status === this.selectedStatus();
      const matchesGovernorate = this.selectedGovernorate() === 'all' ||
        (order.pickup_address ?? '').toLowerCase().includes(this.selectedGovernorate().toLowerCase()) ||
        (order.dropoff_address ?? '').toLowerCase().includes(this.selectedGovernorate().toLowerCase());
      return matchesSearch && matchesStatus && matchesGovernorate;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize)));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  visibleOrders = computed(() => this.filteredOrders().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize));
  startIndex = computed(() => this.filteredOrders().length ? (this.currentPage() - 1) * this.pageSize + 1 : 0);
  endIndex = computed(() => Math.min(this.currentPage() * this.pageSize, this.filteredOrders().length));

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.getAllOrders(); }

  getAllOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.orderService.getAllOrders().subscribe({
      next: data => { this.orders.set(data ?? []); this.isLoading.set(false); },
      error: err => {
        console.error('Error fetching orders:', err);
        this.errorMessage.set('Failed to load orders.');
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(value: string): void { this.searchText.set(value); this.currentPage.set(1); }
  updateStatusFilter(value: string): void { this.selectedStatus.set(value); this.currentPage.set(1); }
  updateGovernorateFilter(value: string): void { this.selectedGovernorate.set(value); this.currentPage.set(1); }
  resetFilters(): void { this.searchText.set(''); this.selectedStatus.set('all'); this.selectedGovernorate.set('all'); this.currentPage.set(1); }
  previousPage(): void { this.currentPage.update(p => Math.max(1, p - 1)); }
  nextPage(): void { this.currentPage.update(p => Math.min(this.totalPages(), p + 1)); }
  goToPage(page: number): void { this.currentPage.set(page); }

  formatStatus(status: string): string { return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  statusClass(status: string): string { return 'status-' + status; }
  formatPrice(value: number): string { return Number(value ?? 0).toLocaleString('en-EG'); }

  changeOrderStatus(order: Order, newStatus: string): void {
    if (newStatus === order.status || this.busyOrderId() !== null) return;
    this.busyOrderId.set(order.id);
    this.notice.set('');
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.orders.update(items => items.map(item => item.id === order.id ? { ...item, status: newStatus } : item));
        this.busyOrderId.set(null);
        this.notice.set('Order status updated.');
      },
      error: err => {
        console.error('Status update failed:', err);
        this.busyOrderId.set(null);
        this.notice.set('Could not update the order status.');
      }
    });
  }

  deleteOrder(order: Order): void {
    if (this.busyOrderId() !== null || !window.confirm(`Delete order ${order.tracking_number}?`)) return;
    this.busyOrderId.set(order.id);
    this.notice.set('');
    this.orderService.deleteOrder(order.id).subscribe({
      next: () => {
        this.orders.update(items => items.filter(item => item.id !== order.id));
        this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
        this.busyOrderId.set(null);
        this.notice.set('Order deleted.');
      },
      error: err => {
        console.error('Delete failed:', err);
        this.busyOrderId.set(null);
        this.notice.set('Could not delete the order.');
      }
    });
  }

  exportOrders(): void {
    const columns: (keyof Order)[] = ['tracking_number', 'customer_name', 'customer_phone', 'pickup_address', 'dropoff_address', 'created_at', 'status', 'total_customer_price'];
    const escape = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const csv = [columns.join(','), ...this.filteredOrders().map(order => columns.map(col => escape(order[col])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wasla-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
