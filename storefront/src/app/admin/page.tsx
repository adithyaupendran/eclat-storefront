import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  await requireAdmin()
  const admin = await createAdminClient()

  const [{ count: productCount }, { count: orderCount }, { count: cartCount }] = await Promise.all([
    admin.from('products').select('*', { count: 'exact', head: true }),
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('cart').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Products', value: productCount ?? 0, href: '/admin/products' },
    { label: 'Orders', value: orderCount ?? 0, href: '/admin/orders' },
    { label: 'Cart Items (Active)', value: cartCount ?? 0, href: '/admin/orders' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* Admin Header */}
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem', letterSpacing: '0.2rem' }}>ÉCLAT ADMIN</span>
          <nav className="flex gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-sm text-white/70 hover:text-white transition-colors">Products</Link>
            <Link href="/admin/orders" className="text-sm text-white/70 hover:text-white transition-colors">Orders</Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">← Storefront</Link>
      </header>

      <main className="max-w-screen-xl mx-auto px-8 py-12">
        <h1 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '2rem', fontWeight: 400 }} className="mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-12">Welcome back. Here's what's happening with ÉCLAT.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {stats.map(s => (
            <Link href={s.href} key={s.label} className="bg-white p-8 border border-gray-100 hover:border-black transition-colors group">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{s.label}</p>
              <p style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '3rem', fontWeight: 300, lineHeight: 1 }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-4 group-hover:text-black transition-colors">View all →</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/admin/products/new" className="bg-black text-white px-8 py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors">
            + ADD PRODUCT
          </Link>
          <Link href="/admin/products" className="border border-black px-8 py-3 text-sm tracking-widest hover:bg-black hover:text-white transition-colors">
            MANAGE STOCK
          </Link>
        </div>
      </main>
    </div>
  )
}
