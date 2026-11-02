import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  user = {
    full_name: '',
    business_name: '',
    email: '',
    phone: '',
    password: ''
  };

  confirmPassword = '';
  showPassword = false;

  message = '';
  error = '';
  loading = false;

  async register() {

    this.message = '';
    this.error = '';

    if (this.user.password !== this.confirmPassword) {
      this.error = 'Passwords do not match!';
      return;
    }

    this.loading = true;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.user)
      });

      if (response.ok) {
        this.message = 'Account created successfully!';
      } else {
        this.error = await response.text();
      }

    } catch {
      this.error = 'Cannot connect to the backend.';
    }

    this.loading = false;
  }
}