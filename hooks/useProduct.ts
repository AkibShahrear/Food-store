import { useEffect, useState } from 'react'
import type { Product } from './useProducts'

export interface ProductWithRatings extends Product {
  ratings: {
    average: number | null
    count: number
    reviews: Array<{
      id: string
      rating: number
      review: string | null
      user_id: string
      created_at: string
    }>
  }
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<ProductWithRatings | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found')
          }
          throw new Error(`Failed to fetch product: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.success) {
          setProduct(data.data)
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}
