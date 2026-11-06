import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideRoute, LucideLogOut, LucideLayoutDashboard, LucidePackage, LucidePackagePlus } from '@lucide/angular';
import { OrderService } from '../../services/order.service'; 
import { Order } from '../../models/order.model'; 

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe, 
    RouterLink, 
    RouterLinkActive,
    LucideRoute, 
    LucideLogOut, 
    LucideLayoutDashboard, 
    LucidePackage, 
    LucidePackagePlus
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {
  order: Order | null = null;
  
  loading = true;
  errorMessage = '';
  isUpdating = false;

  steps = [
    { key: 'pending', label: 'Order placed', icon: 'check' },
    { key: 'picked_up', label: 'Picked up', icon: 'check' },
    { key: 'in_transit', label: 'In transit', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'home' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadOrder(id);
    } else {
      this.errorMessage = 'Invalid Order ID';
      this.loading = false;
    }
  }

  loadOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe({
      next: (data: Order) => {
        this.order = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load order details.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  cancelOrder(): void {
    if (!this.order) return;
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.isUpdating = true;
    this.orderService.updateOrderStatus(this.order.id, 'cancelled').subscribe({
      next: () => {
        this.isUpdating = false;
        this.loadOrder(this.order!.id);
      },
      error: (err: any) => {
        this.isUpdating = false;
        alert('Failed to cancel order.');
      }
    });
  }

  getStepState(stepKey: string): 'completed' | 'active' | 'pending' {
    if (!this.order) return 'pending';
    
    const status = this.order.status.toLowerCase();
    const statusMap: Record<string, number> = {
      'pending': 0, 'accepted': 1, 'picked_up': 1, 'in_transit': 2, 'delivered': 3, 'cancelled': -1
    };

    if (status === 'cancelled') return 'pending';

    const currentIndex = statusMap[status] ?? 0;
    const stepIndex = this.steps.findIndex(s => s.key === stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  }

  getReferenceNumber(): string {
    if (!this.order) return 'N/A';
    return `ORD-${this.order.id}-${this.order.id * 100}`;
  }

  callCustomer(phone?: string): void {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}