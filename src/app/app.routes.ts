import { Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { CreateOrder } from './pages/create-order/create-order';
import { MyOrders } from './pages/my-orders/my-orders';
import { ManageOrders } from './pages/manage-orders/manage-orders';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'create-order', component: CreateOrder, canActivate: [authGuard] },
 { path: 'my-orders', component: MyOrders, canActivate: [authGuard] },
  { path: 'manage-orders', component: ManageOrders, canActivate: [authGuard] }
];