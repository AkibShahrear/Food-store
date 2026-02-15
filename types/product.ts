export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  stock: number
  calories: number | null
  spicy_level: string | null
  created_at: string
  updated_at: string
}

export interface ProductInput {
  name: string
  description?: string
  price: number
  image_url?: string
  category?: string
  stock: number
  calories?: number
  spicy_level?: string
}
