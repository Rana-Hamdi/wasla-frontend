export interface Order {
  id: number;
  tracking_number: string;
  business_user_id: number;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string;
  delivery_notes: string | null;
  package_description: string;
  package_weight_kg: number | null;
  preferred_delivery_at: string;
  item_price: number;
  delivery_fee: number;
  delivery_fee_payer: string;
  payment_type: string;
  total_customer_price: number;
  cod_amount: number;
  cod_collected_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  courier_name?: string;
  courier_phone?: string;
  courier_rating?: number;
  courier_deliveries?: number;
}