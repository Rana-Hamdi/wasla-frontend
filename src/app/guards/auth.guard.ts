import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const router = inject(Router);

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data['role'];

  if (requiredRole && role !== requiredRole) {
    return router.createUrlTree(['/login']);
  }

  return true;
};