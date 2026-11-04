import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-order',
  imports: [FormsModule, RouterLink],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css'
})
export class CreateOrder {
  constructor(private cdr: ChangeDetectorRef) {}

  deliveryFee = 50;

  order = {
    customer_name: '',
    customer_phone: '',
    pickup_address: '',
    dropoff_address: '',
    delivery_notes: '',
    package_description: '',
    package_weight_kg: null as number | null,
    preferred_delivery_at: '',
    item_price: 0,
    delivery_fee_payer: 'customer',
    payment_type: 'cod'
  };

  message = '';
  error = '';
  loading = false;

  totalPrice(): number {
    if (this.order.delivery_fee_payer === 'customer') {
      return this.order.item_price + this.deliveryFee;
    }

    return this.order.item_price;
  }

  codAmount(): number {
    if (this.order.payment_type === 'cod') {
      return this.totalPrice();
    }

    return 0;
  }

  async createOrder() {

    this.message = '';
    this.error = '';

    const token = sessionStorage.getItem('token');

    if (!token) {
      this.error = 'Please log in first.';
      return;
    }

    this.loading = true;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          ...this.order,
          delivery_fee: this.deliveryFee,
          preferred_delivery_at:
            new Date(this.order.preferred_delivery_at).toISOString()
        })
      });

      if (response.ok) {
        this.message = 'Shipment created successfully!';
      } else {
        this.error = 'Could not create shipment.';
      }

    } catch {
      this.error = 'Cannot connect to the backend.';
    }

    this.loading = false;
    this.cdr.markForCheck();
  }
}