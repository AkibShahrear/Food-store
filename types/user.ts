// User profile type - extends Supabase's auth.users
export interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    phone?: string
    address?: string
  }
}
