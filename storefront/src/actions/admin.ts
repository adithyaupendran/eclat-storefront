'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

/**
 * Calls Gemini Vision on the first image URL of a product to generate a
 * plain-text visual description. Called ONCE at product create/update time
 * and stored in the DB — never called at search time.
 *
 * Mirrors the Python backend's seed_chroma.py approach: analyse once,
 * store permanently, search against text only.
 */
async function generateVisualDescription(imageUrls: string[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || imageUrls.length === 0) return null

  // Use the first image URL. Works with Supabase Storage URLs, CDN URLs, etc.
  const imageUrl = imageUrls[0]

  const prompt = `You are a fashion visual analyst. Look at this product image and describe EXACTLY what you see as a garment in one concise sentence covering: garment type, whether it has sleeves (yes/no), sleeve type if applicable, neckline, silhouette, primary colour, and up to 3 key visual details. Return ONLY the description sentence, no extra text.`

  try {
    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { file_data: { mime_type: 'image/jpeg', file_uri: imageUrl } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
    }

    // Try with file_data (URL-based, no base64 needed for public URLs)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )

    if (!res.ok) {
      console.warn(`[generateVisualDescription] Gemini returned ${res.status} — skipping visual description`)
      return null
    }

    const json = await res.json()
    const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return text.trim() || null
  } catch (err) {
    console.warn('[generateVisualDescription] Failed:', err)
    return null
  }
}

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

async function triggerSync() {
  const url = process.env.VECTOR_SEARCH_URL;
  const secret = process.env.VECTOR_SEARCH_SECRET;
  if (!url || !secret) return;

  fetch(`${url}/reindex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'supabase', secret }),
  }).catch(err => {
    console.error('[triggerSync] Error syncing vector search:', err);
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin()
  const admin = await createAdminClient()

  const raw = Object.fromEntries(formData.entries())
  const parsed = ProductSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { id, image_urls, ...rest } = parsed.data
  const slug = id

  // Generate visual description from the first image — once, at save time
  const visual_description = await generateVisualDescription(image_urls)

  const { error } = await admin.from('products').insert({
    id,
    slug,
    image_urls,
    visual_description,
    ...rest,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/')
  triggerSync()
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

  // Regenerate visual description when images are updated
  const visual_description = await generateVisualDescription(image_urls)

  const { error } = await admin
    .from('products')
    .update({ image_urls, visual_description, ...rest })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath(`/products/${id}`)
  // @ts-ignore - Next.js 16 types changed
  revalidateTag(`product-${id}`)
  triggerSync()
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
  // @ts-ignore - Next.js 16 types changed
  revalidateTag(`product-${id}`)
  triggerSync()
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const admin = await createAdminClient()

  const { error } = await admin.from('products').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/')
  triggerSync()
  return { success: true }
}

