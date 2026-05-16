import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = await createAdminClient()

  // First clear cart items referencing non-eclat products
  const { error: cartError } = await admin
    .from('cart')
    .delete()
    .not('product_id', 'like', 'eclat_%')

  // Then delete non-eclat products
  const { data, error } = await admin
    .from('products')
    .delete()
    .not('id', 'like', 'eclat_%')
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ 
    success: true, 
    deleted: data?.map(p => p.id),
    cartError: cartError?.message ?? null
  })
}
