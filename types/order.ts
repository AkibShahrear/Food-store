export interface Order {
  id: string
  user_id: string
  total_price: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface OrderInput {
  total_price: number
  status?: string
}
