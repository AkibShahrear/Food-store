'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function ProductDetails({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1)

  // Sample product data - replace with actual fetching
  const product = {
    id: productId,
    name: 'Delicious Pizza',
    price: 12.99,
    description: 'Fresh handmade pizza with premium ingredients',
    image: '/images/pizza.jpg',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {product.image && (
          <img src={product.image} alt={product.name} className="w-full" />
        )}
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
        <p className="text-gray-700 mb-6">{product.description}</p>
        <div className="flex gap-4">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded w-20"
          />
          <Button>Add to Cart</Button>
        </div>
      </div>
    </div>
  )
}
