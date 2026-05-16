/**
 * /editorial — Server component fetches DB products flagged as editorial.
 * Falls back to the most recent 10 products if none are flagged yet.
 */

import { getAllProducts } from "@/lib/data/products";
import { EditorialClient } from "@/components/eclat/EditorialClient";

async function getEditorialData() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`
  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
  }

  // Fetch site_settings for heading
  const settingsRes = await fetch(
    `${url}/site_settings?key=in.(editorial_heading,editorial_subheading)&select=key,value`,
    { headers, next: { revalidate: 60 } }
  )
  const settingsRows: { key: string; value: string }[] = settingsRes.ok ? await settingsRes.json() : []
  const settingsMap: Record<string, string> = {}
  settingsRows.forEach(r => { settingsMap[r.key] = r.value })

  // Fetch editorial products (is_editorial = true)
  const editorialRes = await fetch(
    `${url}/products?is_editorial=eq.true&order=created_at.desc&select=*`,
    { headers, next: { revalidate: 60 } }
  )
  const editorialRows = editorialRes.ok ? await editorialRes.json() : []

  return {
    heading: settingsMap['editorial_heading'] ?? 'COLLECTION 004',
    subheading: settingsMap['editorial_subheading'] ?? 'EDITORIAL',
    editorialRows,
  }
}

export default async function EditorialPage() {
  const { heading, subheading, editorialRows } = await getEditorialData()
  const allProducts = await getAllProducts()

  // Map DB rows to Product shape
  const editorialProducts = editorialRows.map((p: any) => ({
    id: p.id,
    name: p.title,
    brand: p.brand,
    category: p.category,
    priceINR: Number(p.price),
    originalPriceINR: p.original_price ? Number(p.original_price) : null,
    imageUrl: p.image_urls?.[0] || '',
    shortDescription: p.description || '',
    tags: p.tags || [],
    sizes: p.sizes || [],
    imagePosition: p.image_position || 'center',
    stock: p.stock_quantity,
    rating: Number(p.rating),
    reviewCount: p.review_count,
  }))

  // If no products have is_editorial set, fall back to newest 10
  const displayProducts = editorialProducts.length > 0
    ? editorialProducts
    : allProducts.slice(0, 10)

  return (
    <EditorialClient
      products={displayProducts}
      heading={heading}
      subheading={subheading}
    />
  )
}
