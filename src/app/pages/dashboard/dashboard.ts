import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  orders = [
    {
      tracking_number: 'TRK-1001',
      customer_name: 'Mariam Adel',
      dropoff_address: 'New Cairo',
      cod_amount: 1050,
      status: 'in_transit'
    },
    {
      tracking_number: 'TRK-1002',
      customer_name: 'Omar Khaled',
      dropoff_address: 'Dokki',
      cod_amount: 800,
      status: 'delivered'
    }
  ];

  countStatus(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }

  totalCOD(): number {
    return this.orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.cod_amount, 0);
  }

}