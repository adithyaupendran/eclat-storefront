import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const admin = await createAdminClient()
  const { productId, sizeStock } = await req.json()

  if (!productId || !sizeStock) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await admin
    .from('products')
    .update({ size_stock: sizeStock })
    .eq('id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
