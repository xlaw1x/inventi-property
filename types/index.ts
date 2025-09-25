export interface Ticket {
  id: string
  type: string
  description: string
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed"
  priority_score: number
  unit_id?: string
  created_at?: string
}

export interface Incident {
  id: string
  severity: string
  description: string
  created_at: string
}

export interface ServiceRequest {
  id: string
  svc_type: "visitor" | "delivery"
  status: "pending" | "approved" | "completed" | "cancelled"
  requester_name?: string
  unit_id?: string
  qr_link?: string
  created_at?: string
}

export interface Delivery {
  id: string
  svc_type: "delivery"
  description: string
  status: "pending" | "approved" | "completed" | "cancelled"
  created_at: string
  expected_delivery_date?: string
  completed_at?: string
  cancelled_at?: string
  requester_name?: string
  unit_id?: string
  delivery_company?: string
  tracking_number?: string
}

export interface Unit {
  id: string
  building?: string
  floor?: string
  room?: string
  public_hash?: string
}
