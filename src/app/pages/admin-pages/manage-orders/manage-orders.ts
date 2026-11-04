import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';
import { DatePipe, NgClass } from '@angular/common';


@Component({
imports: [DatePipe, FormsModule, NgClass],  
  selector: 'app-manage-orders',
  styleUrl: './manage-orders.css',
  templateUrl: './manage-orders.html',
})
export class ManageOrders implements OnInit {

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');


  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }



  searchText = signal('');
  selectedStatus = signal('all');
  currentPage = signal(1);
  pageSize = 5;
  selectedGovernorate = signal('all');
  searchId = signal('');

  filteredOrders = computed(() => {
    return this.orders().filter(order => {

      const search = this.searchText().toLowerCase();

      const matchesId = this.searchId() === '' || order.id.toString() === this.searchId().trim();

      const matchesSearch =
        order.tracking_number.toLowerCase().includes(search) ||
        order.customer_name.toLowerCase().includes(search) ||
        order.customer_phone.includes(search);

      const matchesStatus =
        this.selectedStatus() === 'all' ||
        order.status === this.selectedStatus();

      const matchesGovernorate =
        this.selectedGovernorate() === 'all' ||
        order.dropoff_address.toLowerCase().includes(
          this.selectedGovernorate().toLowerCase()
      );

      return matchesSearch && matchesStatus && matchesGovernorate && matchesId;
    });
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredOrders().length / this.pageSize)
  );

  paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;

    return this.filteredOrders().slice(start, start + this.pageSize);
  });

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  updateStatus(order: Order, newStatus: string) {
    if (order.status === newStatus) return;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.orders.update(orders =>
          orders.map(o =>
            o.id === order.id ? { ...o, status: newStatus } : o
          )
        );
      },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Failed to update order status');
        }
      });
  }

  deleteOrder(id: number) {
    const confirmed = confirm('Are you sure you want to delete this order?');

    if (!confirmed) return;

    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this.orders.update(orders =>
          orders.filter(order => order.id !== id)
        );
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete order');
      }
    });
  }

}