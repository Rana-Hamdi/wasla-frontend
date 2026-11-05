import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { OrderService } from '../../../services/order.service';
import { AssignmentService } from '../../../services/assignment.service';

import { Order } from '../../../models/order.model';
import { CourierAssignment } from '../../../models/assignment.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, RouterLink, NgClass ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  orders = signal<Order[]>([]);
  assignments = signal<CourierAssignment[]>([]);

  loading = signal(true);
  errorMessage = signal('');

  totalOrders = computed(() => this.orders().length);

  pendingOrders = computed(() =>
    this.orders().filter(order => order.status === 'pending').length
  );

  deliveredOrders = computed(() =>
    this.orders().filter(order => order.status === 'delivered').length
  );

  activeAssignments = computed(() =>
    this.assignments().filter(assignment =>
      assignment.status === 'pending' ||
      assignment.status === 'accepted'
    ).length
  );

  recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      )
      .slice(0, 5)
  );

  constructor(
    private orderService: OrderService,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      orders: this.orderService.getAllOrders(),
      assignments: this.assignmentService.getAll()
    }).subscribe({
      next: ({ orders, assignments }) => {
        this.orders.set(orders ?? []);
        this.assignments.set(assignments ?? []);
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load dashboard:', err);
        this.errorMessage.set('Could not load dashboard data.');
        this.loading.set(false);
      }
    });
  }
}