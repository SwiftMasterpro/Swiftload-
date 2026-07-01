// ─────────────────────────────────────────────────────────────────────────────
// PRONTO SWIFTLOAD — Complete Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'driver' | 'business' | 'fleet_owner' | 'admin' | 'support'
export type LoadStatus = 'draft' | 'posted' | 'bidding' | 'accepted' | 'in_transit' | 'delivered' | 'disputed' | 'cancelled'
export type BookingStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed'
export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'inactive'
export type ReportType = 'checkpoint' | 'roadblock' | 'accident' | 'traffic' | 'breakdown' | 'flood' | 'construction' | 'weighbridge' | 'fuel_shortage' | 'dangerous_road' | 'unsafe_area' | 'road_closure'
export type Severity = 1 | 2 | 3 | 4 | 5
export type NotificationType = 'bid' | 'booking' | 'payment' | 'message' | 'tracking' | 'alert' | 'system'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  company_name?: string
  company_reg?: string
  address?: string
  city?: string
  country: string
  verified: boolean
  active: boolean
  rating: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface DriverProfile extends Profile {
  licence_number?: string
  licence_expiry?: string
  omang?: string
  transport_permit?: string
  transport_permit_expiry?: string
  insurance_number?: string
  insurance_expiry?: string
  years_experience?: number
  preferred_routes?: string[]
  status: 'available' | 'on_trip' | 'offline'
}

export interface Vehicle {
  id: string
  owner_id: string
  fleet_id?: string
  registration: string
  make: string
  model: string
  year: number
  type: string
  capacity_tons: number
  body_type: string
  status: VehicleStatus
  colour?: string
  mileage?: number
  fuel_type?: string
  last_inspection?: string
  insurance_expiry?: string
  licence_expiry?: string
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface Load {
  id: string
  poster_id: string
  title: string
  description?: string
  category: string
  pickup_address: string
  pickup_city: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_address: string
  dropoff_city: string
  dropoff_lat?: number
  dropoff_lng?: number
  distance_km?: number
  cargo_type: string
  weight_tons: number
  volume_m3?: number
  special_requirements?: string[]
  vehicle_type: string
  budget_min?: number
  budget_max?: number
  suggested_price?: number
  pickup_date: string
  pickup_time?: string
  flexible_dates: boolean
  status: LoadStatus
  photos?: string[]
  bid_count: number
  accepted_bid_id?: string
  created_at: string
  updated_at: string
}

export interface Bid {
  id: string
  load_id: string
  driver_id: string
  vehicle_id?: string
  amount: number
  message?: string
  estimated_pickup?: string
  estimated_delivery?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  ai_score?: number
  created_at: string
  updated_at: string
  driver?: Profile
  vehicle?: Vehicle
}

export interface Booking {
  id: string
  load_id: string
  bid_id?: string
  customer_id: string
  driver_id: string
  vehicle_id?: string
  status: BookingStatus
  pickup_otp?: string
  delivery_otp?: string
  pickup_confirmed_at?: string
  delivery_confirmed_at?: string
  pickup_photo?: string
  delivery_photo?: string
  tracking_code: string
  customer_notes?: string
  driver_notes?: string
  created_at: string
  updated_at: string
  load?: Load
  driver?: Profile
}

export interface TrackingUpdate {
  id: string
  booking_id: string
  driver_id: string
  lat: number
  lng: number
  speed_kmh?: number
  heading?: number
  accuracy?: number
  event?: string
  notes?: string
  created_at: string
}

export interface Escrow {
  id: string
  booking_id: string
  customer_id: string
  driver_id: string
  amount: number
  platform_fee: number
  driver_payout: number
  currency: string
  status: EscrowStatus
  stripe_payment_intent_id?: string
  stripe_transfer_id?: string
  held_at?: string
  released_at?: string
  dispute_reason?: string
  dispute_opened_at?: string
  dispute_resolved_at?: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  pending_balance: number
  total_earned: number
  total_spent: number
  currency: string
  stripe_account_id?: string
  created_at: string
  updated_at: string
}

export interface RoadReport {
  id: string
  reporter_id?: string
  type: ReportType
  title: string
  description?: string
  lat: number
  lng: number
  route?: string
  severity: Severity
  anonymous: boolean
  photo_url?: string
  expires_at: string
  verified_count: number
  dismissed_count: number
  company_visible: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'location' | 'voice'
  file_url?: string
  read_at?: string
  created_at: string
  sender?: Profile
}

export interface Conversation {
  id: string
  booking_id?: string
  load_id?: string
  participants: string[]
  last_message?: string
  last_message_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'credit' | 'debit' | 'hold' | 'release' | 'refund' | 'payout'
  amount: number
  currency: string
  description: string
  reference_id?: string
  status: PaymentStatus
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: TicketStatus
  priority: Priority
  assigned_to?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id?: string
  event: string
  properties?: Record<string, unknown>
  session_id?: string
  ip?: string
  user_agent?: string
  created_at: string
}

// ── API Response types ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ── Form types ────────────────────────────────────────────────────────────────
export interface LoadFormData {
  title: string
  description?: string
  category: string
  cargo_type: string
  weight_tons: number
  volume_m3?: number
  special_requirements?: string[]
  pickup_address: string
  pickup_city: string
  dropoff_address: string
  dropoff_city: string
  vehicle_type: string
  budget_min?: number
  budget_max?: number
  pickup_date: string
  pickup_time?: string
  flexible_dates: boolean
  photos?: File[]
}

export interface BidFormData {
  amount: number
  message?: string
  estimated_pickup?: string
  estimated_delivery?: string
  vehicle_id?: string
}

export interface RoadReportFormData {
  type: ReportType
  title: string
  description?: string
  lat: number
  lng: number
  route?: string
  severity: Severity
  anonymous: boolean
  photo?: File
}

export interface ProfileUpdateData {
  full_name?: string
  phone?: string
  company_name?: string
  company_reg?: string
  address?: string
  city?: string
  avatar_url?: string
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export interface CustomerStats {
  total_loads: number
  active_loads: number
  completed_loads: number
  total_spent: number
  avg_rating_given: number
}

export interface DriverStats {
  total_trips: number
  active_trips: number
  completed_trips: number
  total_earned: number
  on_time_rate: number
  avg_rating: number
  acceptance_rate: number
}

export interface BusinessStats {
  total_loads: number
  active_loads: number
  total_spend: number
  avg_cost_per_km: number
  preferred_carriers: number
  on_time_deliveries: number
}

export interface FleetStats {
  total_vehicles: number
  active_vehicles: number
  maintenance_due: number
  total_revenue: number
  avg_utilisation: number
  drivers_count: number
}

export interface AdminStats {
  total_users: number
  active_users_today: number
  total_loads: number
  active_loads: number
  total_transactions: number
  revenue_today: number
  open_tickets: number
  pending_verifications: number
}
