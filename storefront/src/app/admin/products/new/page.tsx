'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createProduct } from '@/actions/admin'
import { useRouter } from 'next/navigation'
import { ImageUploader } from '@/components/admin/ImageUploader'

export default function NewProductPage() {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const [state, action, isPending] = useActionState(async (_: any, formData: FormData) => {
    formData.set('image_urls', imageUrls.join('\n'))
    const result = await createProduct(formData)
    if (result.success) router.push('/admin/products')
    return result
  }, null)

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem', letterSpacing: '0.2rem' }}>ÉCLAT ADMIN</span>
          <nav className="flex gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white">Dashboard</Link>
            <Link href="/admin/products" className="text-sm text-white/70 hover:text-white">Products</Link>
            <Link href="/admin/orders" className="text-sm text-white/70 hover:text-white">Orders</Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white">← Storefront</Link>
      </header>

      <main className="max-w-screen-md mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products" className="text-sm text-gray-400 hover:text-black">← Back</Link>
          <h1 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '2rem', fontWeight: 400 }}>Add Product</h1>
        </div>

        <form action={action} className="bg-white border border-gray-100 p-8 flex flex-col gap-6">
          {state?.error && <p className="text-red-500 text-sm bg-red-50 p-3">{state.error}</p>}

          {[
            { name: 'id', label: 'Product ID (slug)', placeholder: 'eclat_coat_04' },
            { name: 'title', label: 'Product Name', placeholder: 'The Obsidian Coat' },
            { name: 'brand', label: 'Brand', placeholder: 'ÉCLAT' },
            { name: 'category', label: 'Category', placeholder: 'outerwear, separates, footwear, sets' },
          ].map(f => (
            <div key={f.name} className="flex flex-col gap-2">
              <label className="text-xs tracking-widest text-gray-400 uppercase">{f.label}</label>
              <input name={f.name} required placeholder={f.placeholder}
                className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-gray-400 uppercase">Description</label>
            <textarea name="description" rows={3}
              className="border border-gray-200 focus:border-black p-3 bg-transparent outline-none text-sm resize-none transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { name: 'price', label: 'Price (₹)', placeholder: '185000' },
              { name: 'original_price', label: 'Original Price (₹, optional)', placeholder: '220000' },
              { name: 'stock_quantity', label: 'Stock Quantity', placeholder: '10' },
              { name: 'rating', label: 'Rating (0–5)', placeholder: '4.8' },
            ].map(f => (
              <div key={f.name} className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-gray-400 uppercase">{f.label}</label>
                <input name={f.name} type="number" step="any" placeholder={f.placeholder}
                  className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
              </div>
            ))}
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-gray-400 uppercase">Product Images</label>
            <ImageUploader existingUrls={[]} onUrlsChange={setImageUrls} />
            <p className="text-xs text-gray-400">First image uploaded will be the main display image.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-gray-400 uppercase">Sizes (comma-separated)</label>
            <input name="sizes" placeholder="XS, S, M, L, XL"
              className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-gray-400 uppercase">Tags (comma-separated)</label>
            <input name="tags" placeholder="evening, dark, statement, gothic"
              className="border-b border-gray-200 focus:border-black py-2 bg-transparent outline-none text-sm transition-colors" />
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" disabled={isPending}
              className="bg-black text-white px-10 py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
              {isPending ? 'SAVING...' : 'CREATE PRODUCT'}
            </button>
            <Link href="/admin/products" className="border border-gray-300 px-8 py-3 text-sm tracking-widest hover:border-black transition-colors">
              CANCEL
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
