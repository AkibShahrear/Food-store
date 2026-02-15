interface CartItemProps {
  id: string
  name: string
  price: number
  quantity: number
  onRemove?: () => void
  onQuantityChange?: (quantity: number) => void
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  return (
    <div className="border-b py-4 flex justify-between items-center">
      <div className="flex-1">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-gray-600">${price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange?.(parseInt(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded w-16"
        />
        <span className="font-semibold">${(price * quantity).toFixed(2)}</span>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
