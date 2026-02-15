import ProductGrid from '@/components/product/ProductGrid'

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Food Store</h1>
      <ProductGrid />
    </div>
  )
}
