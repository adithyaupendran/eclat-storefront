'use client'

import { useTransition, useState } from 'react'
import { deleteProduct } from '@/actions/admin'
import { useRouter } from 'next/navigation'

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm(`Delete product "${productId}"? This cannot be undone.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteProduct(productId)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div>
      <button
        disabled={isPending}
        onClick={handleDelete}
        className="text-xs text-red-400 hover:text-red-600 transition-colors underline underline-offset-2"
      >
        {isPending ? '...' : 'Delete'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1 max-w-[150px]">{error}</p>}
    </div>
  )
}
