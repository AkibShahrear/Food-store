import { useEffect, useState } from 'react'
import { Order } from './useOrders'

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(!!orderId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/orders/${orderId}`)
        
        if (response.status === 404) {
          setError('Order not found')
          setOrder(null)
          setLoading(false)
          return
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const result = await response.json()
        if (result.success) {
          setOrder(result.data)
        } else {
          setError(result.error || 'Failed to fetch order')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  return { order, loading, error }
}
