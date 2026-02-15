import ProductDetails from '@/components/product/ProductDetails'

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="container mx-auto py-8">
      <ProductDetails productId={id} />
    </div>
  )
}
