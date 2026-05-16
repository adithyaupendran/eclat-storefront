'use client'

import { useState, useTransition } from 'react'
import { addToCart } from '@/actions/cart'
import { useCartStore } from '@/store/cartStore'

interface Props {
  productId: string
  sizes: string[]
  sizeStock: Record<string, number>
  totalStock: number
}

export function ProductInteractions({ productId, sizes, sizeStock, totalStock }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null)
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const incrementCart = useCartStore((s) => s.incrementCart)

  const hasSizes = sizes && sizes.length > 0

  const getSizeStock = (size: string) => {
    if (Object.keys(sizeStock).length > 0) return sizeStock[size] ?? 0
    return totalStock // fall back to total if no per-size data
  }

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) return
    startTransition(async () => {
      const result = await addToCart(productId, selectedSize, 1)
      if (!result.error) {
        incrementCart(1)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Size selector */}
      {hasSizes && (
        <div>
          <p className="eclat-label mb-3">
            SIZE{selectedSize ? ` — ${selectedSize}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const stock = getSizeStock(size)
              const outOfStock = stock === 0
              return (
                <button
                  key={size}
                  disabled={outOfStock}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] h-10 px-3 border text-xs tracking-widest transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : outOfStock
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {size}
                  {stock > 0 && stock <= 3 && (
                    <span className="block text-[9px] text-amber-500 mt-0.5">{stock} left</span>
                  )}
                </button>
              )
            })}
          </div>
          {hasSizes && !selectedSize && (
            <p className="text-xs mt-2" style={{ color: 'var(--eclat-variant)' }}>Please select a size</p>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isPending || (hasSizes && !selectedSize)}
          className={`eclat-btn-primary w-full text-center py-4 transition-all ${
            isPending || (hasSizes && !selectedSize) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'ADDING...' : added ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
        </button>
        <button className="eclat-btn-secondary w-full text-center py-4">
          ADD TO WISHLIST
        </button>
      </div>
    </div>
  )
}
