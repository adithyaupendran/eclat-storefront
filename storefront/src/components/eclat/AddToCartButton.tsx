'use client'

import { useTransition } from 'react'
import { addToCart } from '@/actions/cart'
import { type Product } from '@/lib/mock/catalog'
import { useCartStore } from '@/store/cartStore'

export function AddToCartButton({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition()
  const incrementCart = useCartStore((s) => s.incrementCart)

  const handleAddToCart = () => {
    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null

    startTransition(async () => {
      const result = await addToCart(product.id, size, 1)
      if (result.error) {
        console.error('Failed to add to cart:', result.error)
      } else {
        incrementCart(1) // Optimistic count increment
      }
    })
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending}
      className={`eclat-btn-primary w-full text-center ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isPending ? 'ADDING...' : 'ADD TO BAG'}
    </button>
  )
}
