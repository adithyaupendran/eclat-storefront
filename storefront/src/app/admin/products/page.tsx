import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { StockEditor } from '@/components/admin/StockEditor'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  await requireAdmin()
  const admin = await createAdminClient()

  const { data: products } = await admin
    .from('products')
    .select('id, title, brand, category, price, stock_quantity, image_urls')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Admin Header */}
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem', letterSpacing: '0.2rem' }}>ÉCLAT ADMIN</span>
          <nav className="flex gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-sm text-white hover:text-white transition-colors">Products</Link>
            <Link href="/admin/orders" className="text-sm text-white/70 hover:text-white transition-colors">Orders</Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">← Storefront</Link>
      </header>

      <main className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '2rem', fontWeight: 400 }} className="mb-1">Products</h1>
            <p className="text-sm text-gray-500">{products?.length ?? 0} products in catalog</p>
          </div>
          <Link href="/admin/products/new" className="bg-black text-white px-8 py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors">
            + ADD PRODUCT
          </Link>
        </div>

        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">Product</th>
                <th className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">Category</th>
                <th className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">Price</th>
                <th className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">Stock</th>
                <th className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products?.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image_urls?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={encodeURI(product.image_urls[0])} alt={product.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.title}</p>
                        <p className="text-xs text-gray-400">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                  <td className="px-6 py-4 text-sm">₹{Number(product.price).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <StockEditor productId={product.id} currentStock={product.stock_quantity} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-xs text-gray-500 hover:text-black transition-colors underline underline-offset-2">Edit</Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
