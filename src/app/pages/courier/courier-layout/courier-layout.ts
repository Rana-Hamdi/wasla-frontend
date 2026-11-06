import { Component, OnInit } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router
} from '@angular/router';

import {
  LucideRoute,
  LucideClipboardList,
  LucideTruck,
  LucideLogOut,
  LucideLayoutDashboard,
  LucideArrowRightLeft,
  LucideLayoutGrid,
  LucideSearch,
  LucideBell,
  LucideChevronRight
} from '@lucide/angular';

@Component({
  selector: 'app-courier-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideRoute,
    LucideClipboardList,
    LucideTruck,
    LucideLogOut,
    LucideLayoutDashboard,
    LucideArrowRightLeft,
    LucideLayoutGrid,
    LucideSearch,
    LucideBell,
    LucideChevronRight
  ],
  templateUrl: './courier-layout.html',
  styleUrl: './courier-layout.css'
})
export class CourierLayout implements OnInit {
  // Replace this with your actual Auth Service logic
  userName: string = 'Ahmed Mostafa'; 
  userInitials: string = 'AM';

  constructor(private router: Router) {}

  ngOnInit() {
    // Example: Grab from session storage or an AuthService
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      this.userName = storedName;
      this.userInitials = storedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
  }

  logout() {
    sessionStorage.removeItem('token');
     sessionStorage.removeItem('role');
     sessionStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }
}