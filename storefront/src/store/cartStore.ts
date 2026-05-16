import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartState {
  count: number
  incrementCart: (by?: number) => void
  setCartCount: (count: number) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      count: 0,
      incrementCart: (by = 1) => set((s) => ({ count: s.count + by })),
      setCartCount: (count) => set({ count }),
    }),
    { name: 'eclat-cart-count' }
  )
)
