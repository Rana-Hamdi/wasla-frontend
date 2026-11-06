import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CourierService } from '../../../services/courier.service';
import { CourierAssignedOrder } from '../../../models/courier-assigned-order.model';

@Component({
  selector: 'app-update-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-status.html',
  styleUrl: './update-status.css'
})
export class UpdateStatusComponent implements OnInit {

  order: CourierAssignedOrder | null = null;

  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  selectedStatus = '';
  notes = '';

  orderId: number | null = null;

  
  statusOptions = [
    { value: 'picked_up', label: 'Picked Up', description: 'Package collected from sender' },
    { value: 'in_transit', label: 'In Transit', description: 'Package is on the way to customer' },
    { value: 'delivered', label: 'Delivered', description: 'Package handed to customer' }
  ];

  private readonly apiUrl = '/api/courier/orders';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private courierService: CourierService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'Invalid order ID.';
      return;
    }

    this.orderId = id;
    this.loadOrder();
  }

  loadOrder(): void {
    if (this.orderId === null) return;

    this.loading = true;
    this.errorMessage = '';

    this.courierService.getAssignedOrders().subscribe({
      next: (orders) => {
        const foundOrder = orders.find(
          order => (order.id ?? order.order_id) === this.orderId
        );

        if (!foundOrder) {
          this.errorMessage = 'Order not found in your assigned orders.';
          this.order = null;
        } else {
          this.order = foundOrder;
          
        
          const dbStatus = foundOrder.order_status || foundOrder.status;
          
          if (dbStatus) {
            
            const normalizedStatus = dbStatus.toLowerCase().replace(/ /g, '_');
            
        
            const isValidOption = this.statusOptions.some(opt => opt.value === normalizedStatus);
            if (isValidOption) {
              this.selectedStatus = normalizedStatus;
            }
          }
         

          if (foundOrder.assignment_status !== 'accepted') {
            this.errorMessage = 'You must accept this assignment before updating its shipment status.';
          }
        }
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load order details.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get currentStatus(): string {
    if (!this.order) return '';
    return this.order.order_status || this.order.status || 'Not available';
  }

  submitStatus(): void {
    if (!this.orderId || !this.order) {
      this.errorMessage = 'Order details are not available.';
      return;
    }

    if (this.order.assignment_status !== 'accepted') {
      this.errorMessage = 'You must accept this assignment first.';
      return;
    }

    if (!this.selectedStatus) {
      this.errorMessage = 'Please select a status.';
      return;
    }

    const token = sessionStorage.getItem('token');

    if (!token) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      return;
    }

   
    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = {
      status: this.selectedStatus,
      notes: this.notes.trim()
    };

    this.http.patch(`${this.apiUrl}/${this.orderId}/status`, body, { headers })
      .subscribe({
        next: () => {
     
          this.successMessage = 'Shipment status updated successfully.';
          this.submitting = false;
          this.cdr.markForCheck();
          
         
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);

          // Reload the order to refresh the history and keep the new status selected
          this.loadOrder(); 
        },
        error: (error) => {
          console.error('Backend Error Details:', error);

          
          let msg = 'Failed to update shipment status.';
          
          if (error.error instanceof ErrorEvent) {
            msg = `Error: ${error.error.message}`; // Client-side error
          } else if (typeof error.error === 'string') {
            msg = error.error; // Backend returned a raw string (e.g. "invalid order status transition")
          } else if (error.error?.message) {
            msg = error.error.message; // Standard JSON object
          } else if (error.error?.detail) {
            msg = error.error.detail; // Alternative JSON format
          } else if (error.message) {
            msg = error.message; // Fallback
          }

          // Make the raw backend error look nicer for the user
          if (msg.toLowerCase().includes('invalid order status transition')) {
            msg = 'Invalid order status transition. You cannot skip delivery steps.';
          }

          
          this.errorMessage = msg;
          this.submitting = false;
          
          
          this.cdr.markForCheck();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/courier/assigned-orders']);
  }

  formatStatus(status: string): string {
    if (!status || status === 'Not available') return status;
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}