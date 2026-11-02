import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

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

        if (data.token) {
          sessionStorage.setItem('token', data.token);
          this.message = 'Login successful!';
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
  }
}