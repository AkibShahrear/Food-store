import { useEffect, useState } from 'react'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    id?: string
    name: string
    image_url?: string
    description?: string
    category?: string
  }
}

export interface Order {
  id: string
  user_id: string
  total_price: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface UseOrdersOptions {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  sortBy?: 'created_at' | 'total_price' | 'status'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
  userId?: string
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options.status) params.append('status', options.status)
        if (options.sortBy) params.append('sortBy', options.sortBy)
        if (options.order) params.append('order', options.order)
        if (options.page) params.append('page', options.page.toString())
        if (options.limit) params.append('limit', options.limit.toString())
        if (options.userId) params.append('userId', options.userId)

        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const result = await response.json()
        if (result.success) {
          setOrders(result.data || [])
          setPagination(result.pagination)
        } else {
          setError(result.error || 'Failed to fetch orders')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [options.status, options.sortBy, options.order, options.page, options.limit, options.userId])

  return { orders, pagination, loading, error }
}
