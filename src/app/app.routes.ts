import { Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { CreateOrder } from './pages/create-order/create-order';
import { MyOrders } from './pages/my-orders/my-orders';
import { OrderDetails } from './pages/order-details/order-details';

import { authGuard } from './guards/auth.guard';

import { AdminLayout } from './pages/admin-pages/admin-layout/admin-layout';
import { Dashboard as AdminDashboard } from './pages/admin-pages/dashboard/dashboard';
import { ManageOrders } from './pages/admin-pages/manage-orders/manage-orders';
import { CourierAssignments } from './pages/admin-pages/courier-assignments/courier-assignments';

import { CourierLayout } from './pages/courier/courier-layout/courier-layout';
import { AssignedOrdersComponent } from './pages/courier/assigned-orders/assigned-orders';
import { UpdateStatusComponent } from './pages/courier/update-status/update-status';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

 { path: 'dashboard', component: Dashboard, canActivate: [authGuard], data: { role: 'business' } },
{ path: 'create-order', component: CreateOrder, canActivate: [authGuard], data: { role: 'business' } },
{ path: 'my-orders', component: MyOrders, canActivate: [authGuard], data: { role: 'business' } },
{ path: 'order-details/:id', component: OrderDetails, canActivate: [authGuard], data: { role: 'business' } },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'manage-orders', component: ManageOrders },
      { path: 'courier-assignments', component: CourierAssignments }
    ]
  },

  {
    path: 'courier',
    component: CourierLayout,
    canActivate: [authGuard],
    data: { role: 'courier' },
    children: [
      { path: '', redirectTo: 'assigned-orders', pathMatch: 'full' },
      { path: 'assigned-orders', component: AssignedOrdersComponent },
      { path: 'update-status/:id', component: UpdateStatusComponent },
      { path: 'update-status', redirectTo: 'assigned-orders', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
