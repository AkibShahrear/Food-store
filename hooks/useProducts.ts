import { useEffect, useState } from 'react'

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

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface UseProductsOptions {
  category?: string
  search?: string
  sortBy?: 'price' | 'name' | 'created_at' | 'stock'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (options?.category) params.append('category', options.category)
        if (options?.search) params.append('search', options.search)
        if (options?.sortBy) params.append('sortBy', options.sortBy)
        if (options?.order) params.append('order', options.order)
        if (options?.page) params.append('page', options.page.toString())
        if (options?.limit) params.append('limit', options.limit.toString())

        const response = await fetch(`/api/products?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.success) {
          setProducts(data.data)
          setPagination(data.pagination)
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [options?.category, options?.search, options?.sortBy, options?.order, options?.page, options?.limit])

  return { products, pagination, loading, error }
}
