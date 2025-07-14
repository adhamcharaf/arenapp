// Types pour ARENAPP - Système de réservation sportive Côte d'Ivoire

export type AuthType = 'account' | 'guest'
export type SportType = 'padel' | 'football'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type PaymentProvider = 'wave' | 'orange' | 'mtn'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMode = 'live' | 'mock'

export interface User {
  id: string
  email?: string
  phone?: string
  auth_type: AuthType
  created_at: string
  updated_at?: string
}

export interface Venue {
  id: string
  name: string
  sport_type: SportType
  location: string
  price_per_hour: number
  description?: string
  created_at: string
  updated_at?: string
}

export interface TimeSlot {
  id: string
  venue_id: string
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  updated_at?: string
  venue?: Venue
}

export interface Booking {
  id: string
  user_id: string
  venue_id: string
  time_slot_id: string
  status: BookingStatus
  phone_number: string
  total_amount: number
  notes?: string
  created_at: string
  updated_at?: string
  user?: User
  venue?: Venue
  time_slot?: TimeSlot
}

export interface Payment {
  id: string
  booking_id: string
  provider: PaymentProvider
  amount: number
  status: PaymentStatus
  transaction_id?: string
  external_ref?: string
  created_at: string
  updated_at?: string
  booking?: Booking
}

export interface BookingHistory {
  id: string
  booking_id: string
  action: string
  timestamp: string
  notes?: string
  booking?: Booking
}

export interface AuditLog {
  id: string
  table_name: string
  action: string
  user_id?: string
  changes: Record<string, unknown>
  created_at: string
}

// Types pour le mode mock des paiements
export interface MockPaymentResponse {
  success: true
  payment_id: string
  checkout_url?: string
  session_id: string
  message: string
  mock: true
}