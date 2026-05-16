'use client'

import { useTransition, useState } from 'react'
import { updateProduct } from '@/actions/admin'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  sizes: string[]
  sizeStock: Record<string, number>
}

export function SizeStockEditor({ productId, sizes, sizeStock: initial }: Props) {
  const [sizeStock, setSizeStock] = useState<Record<string, number>>(initial ?? {})
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  if (!sizes || sizes.length === 0) return null

  const setSize = (size: string, val: number) => {
    setSizeStock(prev => ({ ...prev, [size]: Math.max(0, val) }))
  }

  const save = () => {
    startTransition(async () => {
      const fd = new FormData()
      // Re-send all required fields to pass Zod validation
      // We only need to update size_stock via a direct admin call
      const res = await fetch(`/api/admin/size-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sizeStock }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    })
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs tracking-widest text-gray-400 uppercase">Stock Per Size</h3>
        {saved && <span className="text-xs text-green-500">Saved ✓</span>}
      </div>
      <div className="flex flex-wrap gap-4">
        {sizes.map(size => (
          <div key={size} className="flex flex-col items-center gap-2">
            <label className="text-xs text-gray-500 tracking-wider">{size}</label>
            <input
              type="number"
              min={0}
              value={sizeStock[size] ?? 0}
              onChange={e => setSize(size, Number(e.target.value))}
              className="w-16 border border-gray-200 focus:border-black px-2 py-2 text-sm text-center outline-none transition-colors"
            />
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={isPending}
        className="mt-4 bg-black text-white px-8 py-2 text-xs tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending ? 'SAVING...' : 'SAVE SIZE STOCK'}
      </button>
    </div>
  )
}
