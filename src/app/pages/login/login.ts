import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  constructor(
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

  email = '';
  password = '';
  showPassword = false;

  message = '';
  error = '';
  loading = false;

  
async login() {
  this.message = '';
  this.error = '';
  this.loading = true;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.email,
        password: this.password
      })
    });

    if (response.ok) {
      const data = await response.json();

      console.log('Login user:', {
        role: data.role,
        full_name: data.full_name
      });

      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.role);


        if (data.role === 'business') {
          await this.router.navigate(['/dashboard']);

        } else if (data.role === 'admin') {
          await this.router.navigate(['/admin/dashboard']);

        } else if (data.role === 'courier') {
          await this.router.navigate(['/courier/assigned-orders']);

        } else {
          this.error = `Unknown user role: ${data.role}`;
        }

      } else {
        this.error = 'Login response is missing a token.';
      }

    } else {
      this.error = 'Incorrect email or password.';
    }

  } catch {
    this.error = 'Cannot connect to the backend.';
  }

  this.loading = false;
  this.cdr.markForCheck();
}

}