'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  image_urls: string[]
  is_editorial: boolean
}

interface Props {
  heading: string
  subheading: string
  products: Product[]
}

export function EditorialAdminForm({ heading: initHeading, subheading: initSub, products }: Props) {
  const [heading, setHeading] = useState(initHeading)
  const [subheading, setSubheading] = useState(initSub)
  const [editorialIds, setEditorialIds] = useState<Set<string>>(
    new Set(products.filter(p => p.is_editorial).map(p => p.id))
  )
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleProduct = (id: string) => {
    setEditorialIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const save = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/admin/editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading, subheading, editorialIds: Array.from(editorialIds) }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  return (
    <div className="flex flex-col gap-10">
      {error && <p className="text-red-500 text-sm bg-red-50 p-3">{error}</p>}

      {/* Heading editor */}
      <div className="bg-white border border-gray-100 p-8 flex flex-col gap-6">
        <h2 className="text-xs tracking-widest text-gray-400 uppercase">Editorial Heading</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Main Heading</label>
            <input
              value={heading}
              onChange={e => setHeading(e.target.value)}
              placeholder="COLLECTION 004"
              className="w-full border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm tracking-widest"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Subheading</label>
            <input
              value={subheading}
              onChange={e => setSubheading(e.target.value)}
              placeholder="EDITORIAL"
              className="w-full border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm tracking-widest"
            />
          </div>
        </div>
      </div>

      {/* Product picker */}
      <div className="bg-white border border-gray-100 p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase">Editorial Products</h2>
          <p className="text-xs text-gray-400 mt-1">Select which products appear in the editorial slideshow.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => {
            const selected = editorialIds.has(product.id)
            const imgUrl = product.image_urls?.[0]
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className={`relative border-2 transition-all text-left ${
                  selected ? 'border-black' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  {selected && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{product.title}</p>
                  <p className="text-[10px] text-gray-400">{product.id}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={isPending}
          className="bg-black text-white px-10 py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isPending ? 'SAVING...' : 'SAVE EDITORIAL'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved successfully ✓</span>}
      </div>
    </div>
  )
}
