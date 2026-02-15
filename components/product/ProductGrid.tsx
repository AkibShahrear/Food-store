'use client'

import ProductCard from './ProductCard'

export default function ProductGrid() {
  // Sample products - replace with actual data fetching
  const products = [
    {
      id: '1',
      name: 'Pizza',
      price: 12.99,
      description: 'Delicious cheese pizza',
    },
    {
      id: '2',
      name: 'Burger',
      price: 10.99,
      description: 'Juicy hamburger',
    },
    {
      id: '3',
      name: 'Salad',
      price: 8.99,
      description: 'Fresh garden salad',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
