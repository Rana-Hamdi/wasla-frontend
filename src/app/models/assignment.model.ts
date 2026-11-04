export interface CourierAssignment {
  id: number;
  order_id: number;
  courier_id: number;
  assigned_by: number;
  status: 'pending' | 'accepted' | 'declined' | 'reassigned';
  assigned_at: string;
  responded_at: string | null;
}