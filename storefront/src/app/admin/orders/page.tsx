import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminOrdersPage() {
  await requireAdmin()
  const admin = await createAdminClient()

  // Fetch cart items (active orders proxy) with product and user info
  const { data: cartItems } = await admin
    .from('cart')
    .select(`
      id, quantity, size, created_at,
      product:product_id(id, title, price, brand),
      user_id, guest_id
    `)
    .order('created_at', { ascending: false })

  // Fetch actual orders if any
  const { data: orders } = await admin
    .from('orders')
    .select('id, user_id, status, total_amount, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem', letterSpacing: '0.2rem' }}>ÉCLAT ADMIN</span>
          <nav className="flex gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white">Dashboard</Link>
            <Link href="/admin/products" className="text-sm text-white/70 hover:text-white">Products</Link>
            <Link href="/admin/orders" className="text-sm text-white hover:text-white">Orders</Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white">← Storefront</Link>
      </header>

      <main className="max-w-screen-xl mx-auto px-8 py-12">
        <h1 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '2rem', fontWeight: 400 }} className="mb-2">Orders</h1>
        <p className="text-sm text-gray-400 mb-10">Confirmed orders from customers</p>

        {orders && orders.length > 0 ? (
          <div className="bg-white border border-gray-100 overflow-hidden mb-12">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Order ID', 'User', 'Status', 'Total', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm">{order.user_id?.slice(0, 8) ?? 'Guest'}...</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 ${
                        order.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 p-12 text-center mb-12">
            <p className="text-gray-400 text-sm">No confirmed orders yet. Orders will appear here after checkout.</p>
          </div>
        )}

        {/* Active Carts (live shopping intent) */}
        <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-4">Active Carts ({cartItems?.length ?? 0} items)</h2>
        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                {['Product', 'Size', 'Qty', 'User / Guest', 'Added'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs tracking-widest text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cartItems?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{item.product?.title}</p>
                    <p className="text-xs text-gray-400">{item.product?.brand}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.size || '—'}</td>
                  <td className="px-6 py-4 text-sm">{item.quantity}</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {item.user_id ? `User: ${item.user_id.slice(0, 8)}...` : `Guest: ${item.guest_id?.slice(0, 8)}...`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {(!cartItems || cartItems.length === 0) && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No active carts.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
