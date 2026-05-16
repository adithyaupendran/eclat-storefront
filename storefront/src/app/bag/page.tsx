import Link from 'next/link'
import { cookies } from 'next/headers'
import { EclatNav } from '@/components/eclat/EclatNav'
import { EclatFooter } from '@/components/eclat/EclatFooter'
import { createClient } from '@/lib/supabase/server'
import { BagItemControls } from '@/components/eclat/BagItemControls'

async function getCartItems() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use admin client to read with service role for guest access
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (user) {
    const res = await fetch(
      `${adminUrl}/rest/v1/cart?user_id=eq.${user.id}&select=id,quantity,size,product:product_id(id,title,brand,price,image_urls,stock_quantity)`,
      { headers: { apikey: adminKey, Authorization: `Bearer ${adminKey}` }, cache: 'no-store' }
    )
    return res.ok ? (await res.json()) : []
  } else {
    const cookieStore = await cookies()
    const guestId = cookieStore.get('eclat_guest_id')?.value
    if (!guestId) return []

    const res = await fetch(
      `${adminUrl}/rest/v1/cart?guest_id=eq.${guestId}&select=id,quantity,size,product:product_id(id,title,brand,price,image_urls,stock_quantity)`,
      { headers: { apikey: adminKey, Authorization: `Bearer ${adminKey}` }, cache: 'no-store' }
    )
    return res.ok ? (await res.json()) : []
  }
}

export default async function BagPage() {
  const items = await getCartItems()

  const total = items.reduce((sum: number, item: { product?: { price?: number }, quantity: number }) => {
    return sum + (Number(item.product?.price ?? 0) * item.quantity)
  }, 0)

  return (
    <>
      <EclatNav />
      <main className="pt-20 min-h-screen eclat-surface">
        <div className="max-w-screen-lg mx-auto px-6 py-12">
          <h1 className="mb-2" style={{ fontFamily: 'var(--font-noto-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400 }}>
            Your Bag
          </h1>
          <p className="eclat-label mb-12" style={{ color: 'var(--eclat-variant)' }}>
            {items.length === 0 ? 'Nothing here yet.' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
          </p>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <p className="eclat-body text-center" style={{ color: 'var(--eclat-variant)', maxWidth: 320 }}>
                Your bag is empty. Browse the collection and add pieces you love.
              </p>
              <Link href="/" className="eclat-btn-primary px-10 py-3">EXPLORE COLLECTION</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-12">
              {/* Items list */}
              <div className="md:col-span-2 flex flex-col divide-y divide-[rgba(0,0,0,0.06)]">
                {items.map((item: { id: string, size?: string, quantity: number, product?: { title: string, brand: string, price: number, image_urls: string[] } }) => {
                  const p = item.product
                  const imageUrl = p?.image_urls?.[0]
                  return (
                    <div key={item.id} className="flex gap-6 py-8">
                      {/* Image */}
                      <div className="w-28 h-36 bg-[#f3f3f3] flex-shrink-0 relative overflow-hidden">
                        {imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={encodeURI(imageUrl)}
                            alt={p?.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="eclat-label mb-1">{p?.brand}</p>
                          <p style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1.1rem' }}>{p?.title}</p>
                          {item.size && <p className="eclat-label mt-1" style={{ color: 'var(--eclat-variant)' }}>Size: {item.size}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.95rem' }}>
                            ₹{Number(p?.price ?? 0).toLocaleString('en-IN')}
                          </p>
                          <BagItemControls cartItemId={item.id} quantity={item.quantity} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="md:col-span-1">
                <div className="sticky top-24 border border-[rgba(0,0,0,0.06)] p-8 bg-white/60 backdrop-blur-sm">
                  <h2 className="eclat-label mb-6 tracking-widest">ORDER SUMMARY</h2>
                  <div className="flex justify-between mb-3">
                    <span className="eclat-body">Subtotal</span>
                    <span style={{ fontFamily: 'var(--font-inter)' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between mb-8 pb-6 border-b border-[rgba(0,0,0,0.06)]">
                    <span className="eclat-body">Shipping</span>
                    <span className="eclat-label" style={{ color: 'var(--eclat-variant)' }}>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between mb-8">
                    <span style={{ fontFamily: 'var(--font-noto-serif)', fontSize: '1rem' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '1.1rem' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <button className="eclat-btn-primary w-full py-4 text-center">
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <EclatFooter />
      </main>
    </>
  )
}
