import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  role: "buyer" | "seller" | "agent" | "admin"
  preferences: Record<string, any>
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Property {
  id: number
  title: string
  description?: string
  price: number
  property_type: "house" | "apartment" | "condo" | "townhouse" | "land" | "commercial"
  status: "active" | "pending" | "sold" | "inactive"
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  lot_size?: number
  year_built?: number
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number
  longitude?: number
  features: string[]
  amenities: string[]
  images: string[]
  virtual_tour_url?: string
  agent_id?: string
  seller_id?: string
  created_at: string
  updated_at: string
}

export interface PropertyView {
  id: number
  property_id: number
  user_id: string
  viewed_at: string
  duration_seconds?: number
}

export interface Favorite {
  id: number
  user_id: string
  property_id: number
  created_at: string
}

export interface SavedSearch {
  id: number
  user_id: string
  name: string
  criteria: Record<string, any>
  alert_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: number
  property_id: number
  user_id: string
  agent_id?: string
  message: string
  contact_method: "email" | "phone" | "both"
  status: "new" | "contacted" | "scheduled" | "closed"
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  property_id: number
  user_id: string
  agent_id: string
  appointment_date: string
  duration_minutes: number
  type: "viewing" | "consultation" | "inspection"
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
}

export interface ChatConversation {
  id: number
  user_id: string
  title?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  conversation_id: number
  role: "user" | "assistant"
  content: string
  metadata: Record<string, any>
  created_at: string
}

export interface UserRecommendation {
  id: number
  user_id: string
  property_id: number
  score: number
  reasons: string[]
  created_at: string
}
