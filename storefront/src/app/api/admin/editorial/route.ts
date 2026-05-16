import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const admin = await createAdminClient()
  const { heading, subheading, editorialIds } = await req.json()

  // Upsert site_settings for heading and subheading
  await admin.from('site_settings').upsert([
    { key: 'editorial_heading', value: heading },
    { key: 'editorial_subheading', value: subheading },
  ], { onConflict: 'key' })

  // Update is_editorial on all products
  const allProductIds: string[] = (await admin.from('products').select('id')).data?.map((p: any) => p.id) ?? []

  // Set all to false first
  await admin.from('products').update({ is_editorial: false }).in('id', allProductIds)

  // Set selected to true
  if (editorialIds.length > 0) {
    const { error } = await admin.from('products').update({ is_editorial: true }).in('id', editorialIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
