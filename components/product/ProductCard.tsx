import Link from 'next/link'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image?: string
  description?: string
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
}: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      {image && (
        <img src={image} alt={name} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-3">{description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">${price.toFixed(2)}</span>
          <Link
            href={`/products/${id}`}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
