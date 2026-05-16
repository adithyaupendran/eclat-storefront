import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { EditProductForm } from '@/components/admin/EditProductForm'
import { SizeStockEditor } from '@/components/admin/SizeStockEditor'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const admin = await createAdminClient()

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem', letterSpacing: '0.2rem' }}>ÉCLAT ADMIN</span>
          <nav className="flex gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white">Dashboard</Link>
            <Link href="/admin/products" className="text-sm text-white hover:text-white">Products</Link>
            <Link href="/admin/orders" className="text-sm text-white/70 hover:text-white">Orders</Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white">← Storefront</Link>
      </header>

      <main className="max-w-screen-md mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products" className="text-sm text-gray-400 hover:text-black">← Back</Link>
          <div>
            <h1 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '2rem', fontWeight: 400 }}>Edit Product</h1>
            <p className="text-xs text-gray-400 mt-0.5">{product.id}</p>
          </div>
        </div>

        <EditProductForm product={product} />
        <SizeStockEditor
          productId={product.id}
          sizes={product.sizes ?? []}
          sizeStock={product.size_stock ?? {}}
        />
      </main>
    </div>
  )
}
