'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/actions/admin'
import { ImageUploader } from '@/components/admin/ImageUploader'

interface Product {
  id: string
  title: string
  brand: string
  description: string
  price: number
  original_price?: number
  category: string
  image_urls: string[]
  tags: string[]
  sizes: string[]
  stock_quantity: number
  rating: number
  review_count: number
}

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<string[]>(product.image_urls ?? [])

  const [state, action, isPending] = useActionState(async (_: any, formData: FormData) => {
    // Inject current image URLs from uploader state
    imageUrls.forEach(url => formData.append('image_url_item', url))
    // Replace the image_urls field with newline-joined URLs
    formData.set('image_urls', imageUrls.join('\n'))
    const result = await updateProduct(product.id, formData)
    if (result.success) router.push('/admin/products')
    return result
  }, null)

  return (
    <form action={action} className="bg-white border border-gray-100 p-8 flex flex-col gap-6">
      {state?.error && <p className="text-red-500 text-sm bg-red-50 p-3">{state.error}</p>}

      {[
        { name: 'title', label: 'Product Name', defaultValue: product.title },
        { name: 'brand', label: 'Brand', defaultValue: product.brand },
        { name: 'category', label: 'Category', defaultValue: product.category },
      ].map(f => (
        <div key={f.name} className="flex flex-col gap-2">
          <label className="text-xs tracking-widest text-gray-400 uppercase">{f.label}</label>
          <input name={f.name} required defaultValue={f.defaultValue}
            className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-gray-400 uppercase">Description</label>
        <textarea name="description" rows={3} defaultValue={product.description}
          className="border border-gray-200 focus:border-black p-3 bg-transparent outline-none text-sm resize-none transition-colors" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[
          { name: 'price', label: 'Price (₹)', defaultValue: product.price },
          { name: 'original_price', label: 'Original Price (₹)', defaultValue: product.original_price ?? '' },
          { name: 'stock_quantity', label: 'Stock', defaultValue: product.stock_quantity },
          { name: 'rating', label: 'Rating (0–5)', defaultValue: product.rating },
        ].map(f => (
          <div key={f.name} className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-gray-400 uppercase">{f.label}</label>
            <input name={f.name} type="number" step="any" defaultValue={String(f.defaultValue)}
              className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
          </div>
        ))}
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-gray-400 uppercase">Product Images</label>
        <ImageUploader existingUrls={imageUrls} onUrlsChange={setImageUrls} />
        <p className="text-xs text-gray-400">First image is the main display image.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-gray-400 uppercase">Sizes (comma-separated)</label>
        <input name="sizes" defaultValue={(product.sizes ?? []).join(', ')}
          className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-widest text-gray-400 uppercase">Tags (comma-separated)</label>
        <input name="tags" defaultValue={(product.tags ?? []).join(', ')}
          className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
      </div>

      <div className="flex gap-4 mt-4">
        <button type="submit" disabled={isPending}
          className="bg-black text-white px-10 py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
          {isPending ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
        <Link href="/admin/products" className="border border-gray-300 px-8 py-3 text-sm tracking-widest hover:border-black transition-colors">
          CANCEL
        </Link>
      </div>
    </form>
  )
}
