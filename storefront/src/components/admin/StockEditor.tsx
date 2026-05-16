'use client'

import { useTransition, useState } from 'react'
import { updateStock } from '@/actions/admin'

export function StockEditor({ productId, currentStock }: { productId: string; currentStock: number }) {
  const [stock, setStock] = useState(currentStock)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = () => {
    startTransition(async () => {
      const result = await updateStock(productId, stock)
      if (!result.error) {
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${stock <= 5 ? 'text-red-500' : stock <= 10 ? 'text-amber-500' : 'text-gray-700'}`}>
          {stock}
        </span>
        {saved && <span className="text-xs text-green-500">Saved</span>}
        <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-black transition-colors ml-1">edit</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={stock}
        min={0}
        onChange={e => setStock(Number(e.target.value))}
        className="w-16 border border-black px-2 py-1 text-sm outline-none"
        autoFocus
      />
      <button onClick={save} disabled={isPending} className="text-xs bg-black text-white px-3 py-1 hover:bg-gray-800 transition-colors">
        {isPending ? '...' : 'Save'}
      </button>
      <button onClick={() => { setStock(currentStock); setEditing(false) }} className="text-xs text-gray-400 hover:text-black transition-colors">Cancel</button>
    </div>
  )
}
