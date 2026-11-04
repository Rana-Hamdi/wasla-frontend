import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router} from '@angular/router';
import { LucideLayoutDashboard, LucidePackage, LucideTruck, LucideLogOut, LucideSearch, LucideBell, LucideChevronRight} from '@lucide/angular';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideLayoutDashboard, LucidePackage, LucideTruck, LucideLogOut, LucideSearch, LucideBell, LucideChevronRight],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

  constructor(private router: Router) {}

  // remove token 
  logout() {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}