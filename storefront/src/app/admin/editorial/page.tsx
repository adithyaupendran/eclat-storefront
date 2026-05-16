import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { EditorialAdminForm } from '@/components/admin/EditorialAdminForm'

export default async function AdminEditorialPage() {
  await requireAdmin()
  const admin = await createAdminClient()

  // Fetch current editorial settings
  const { data: settings } = await admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['editorial_heading', 'editorial_subheading'])

  const settingsMap: Record<string, string> = {}
  settings?.forEach(s => { settingsMap[s.key] = s.value })

  // Fetch all products so admin can pick which appear in editorial
  const { data: products } = await admin
    .from('products')
    .select('id, title, image_urls, is_editorial')
    .order('title')

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem', letterSpacing: '0.2rem' }}>ÉCLAT ADMIN</span>
          <nav className="flex gap-6">
            <Link href="/admin" className="text-sm text-white/70 hover:text-white">Dashboard</Link>
            <Link href="/admin/products" className="text-sm text-white/70 hover:text-white">Products</Link>
            <Link href="/admin/orders" className="text-sm text-white/70 hover:text-white">Orders</Link>
            <Link href="/admin/editorial" className="text-sm text-white hover:text-white">Editorial</Link>
          </nav>
        </div>
        <Link href="/" className="text-sm text-white/50 hover:text-white">← Storefront</Link>
      </header>

      <main className="max-w-screen-md mx-auto px-8 py-12">
        <h1 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '2rem', fontWeight: 400, marginBottom: '2rem' }}>
          Editorial Settings
        </h1>
        <EditorialAdminForm
          heading={settingsMap['editorial_heading'] ?? 'COLLECTION 004'}
          subheading={settingsMap['editorial_subheading'] ?? 'EDITORIAL'}
          products={products ?? []}
        />
      </main>
    </div>
  )
}
