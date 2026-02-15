'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import CartItem from './CartItem'

export default function CartSummary() {
  // Sample cart items - replace with actual cart state
  const cartItems = [
    { id: '1', name: 'Pizza', price: 12.99, quantity: 2 },
    { id: '2', name: 'Burger', price: 10.99, quantity: 1 },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartItem key={item.id} {...item} />
          ))
        ) : (
          <p>Your cart is empty</p>
        )}
      </div>
      <div className="bg-gray-100 p-6 rounded-lg h-fit">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <Link href="/checkout">
          <Button className="w-full mt-6">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  )
}
