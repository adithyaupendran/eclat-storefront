'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  brand: z.string().min(1),
  description: z.string(),
  price: z.coerce.number().positive(),
  original_price: z.coerce.number().positive().nullable().optional(),
  category: z.string().min(1),
  image_urls: z.string().transform(s => s.split('\n').map(u => u.trim()).filter(Boolean)),
  tags: z.string().transform(s => s.split(',').map(t => t.trim()).filter(Boolean)),
  sizes: z.string().transform(s => s.split(',').map(sz => sz.trim()).filter(Boolean)),
  stock_quantity: z.coerce.number().int().min(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  review_count: z.coerce.number().int().min(0).default(0),
})

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const admin = await createAdminClient()

  const raw = Object.fromEntries(formData.entries())
  const parsed = ProductSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { id, image_urls, ...rest } = parsed.data
  const slug = id

  const { error } = await admin.from('products').insert({
    id,
    slug,
    image_urls,
    ...rest,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin()
  const admin = await createAdminClient()

  const raw = Object.fromEntries(formData.entries())
  const UpdateSchema = ProductSchema.omit({ id: true })
  const parsed = UpdateSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { image_urls, ...rest } = parsed.data

  const { error } = await admin
    .from('products')
    .update({ image_urls, ...rest })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath(`/products/${id}`)
  revalidateTag(`product-${id}`)
  return { success: true }
}

export async function updateStock(id: string, stock: number) {
  await requireAdmin()
  const admin = await createAdminClient()

  const { error } = await admin
    .from('products')
    .update({ stock_quantity: stock })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidateTag(`product-${id}`)
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const admin = await createAdminClient()

  const { error } = await admin.from('products').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}
