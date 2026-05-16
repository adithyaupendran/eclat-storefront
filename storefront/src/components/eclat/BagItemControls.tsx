'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'

export function BagItemControls({ cartItemId, quantity }: { cartItemId: string; quantity: number }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { incrementCart, setCartCount, count } = useCartStore()

  const update = async (newQty: number) => {
    const supabase = createClient()

    if (newQty <= 0) {
      await supabase.from('cart').delete().eq('id', cartItemId)
      useCartStore.getState().setCartCount(Math.max(0, count - quantity))
    } else {
      await supabase.from('cart').update({ quantity: newQty }).eq('id', cartItemId)
      const diff = newQty - quantity
      useCartStore.getState().incrementCart(diff)
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => update(quantity - 1))}
        className="w-7 h-7 border border-[rgba(0,0,0,0.15)] flex items-center justify-center text-sm hover:border-black transition-colors"
      >
        −
      </button>
      <span className="eclat-label w-4 text-center">{quantity}</span>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => update(quantity + 1))}
        className="w-7 h-7 border border-[rgba(0,0,0,0.15)] flex items-center justify-center text-sm hover:border-black transition-colors"
      >
        +
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => update(0))}
        className="eclat-label ml-2 hover:text-black transition-colors"
        style={{ color: 'var(--eclat-variant)' }}
      >
        Remove
      </button>
    </div>
  )
}
