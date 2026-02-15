'use client'

import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <CartSummary />
    </div>
  )
}
