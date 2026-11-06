export interface CourierAssignedOrder {
  id?: number;
  order_id?: number;
  tracking_number: string;
  customer_name: string;
  customer_phone?: string;
  pickup_address?: string;
  dropoff_address: string;
  package_description?: string;
  package_weight_kg?: number | null;
  preferred_delivery_at?: string;
  item_price?: number;
  delivery_fee?: number;
  delivery_fee_payer?: string;
  payment_type?: string;
  total_customer_price?: number;
  cod_amount?: number;
  order_status?: string;
  status?: string;
  assignment_id?: number;
  assignment_status: 'pending' | 'accepted' | 'declined' | 'reassigned' | string;
  assigned_at?: string;
}

export interface CourierApiResponse<T> {
  message?: string;
  data?: T;
  orders?: T;
}
