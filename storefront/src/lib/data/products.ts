import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type Product } from '@/lib/mock/catalog'

// Fetch without cookies — uses anon key only, safe for public product data
async function fetchProductFromDB(idOrSlug: string): Promise<Product | null> {
  // Use supabase directly with fetch (no cookies needed for public product reads)
  const encoded = encodeURIComponent(idOrSlug)
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?or=(id.eq.${encoded},slug.eq.${encoded})&limit=1`
  
  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    next: { revalidate: 3600, tags: [`product-${idOrSlug}`] },
  })

  if (!res.ok) {
    console.error('Supabase REST fetch error:', res.status, await res.text())
    return null
  }

  const rows = await res.json()
  const product = rows?.[0]
  if (!product) return null

  return dbRowToProduct(product)
}

function dbRowToProduct(product: any): Product {
  return {
    id: product.id,
    name: product.title,
    brand: product.brand,
    category: product.category,
    priceINR: Number(product.price),
    originalPriceINR: product.original_price ? Number(product.original_price) : null,
    imageUrl: product.image_urls?.[0] || '',
    imageUrls: product.image_urls || [],
    shortDescription: product.description || '',
    tags: product.tags || [],
    sizes: product.sizes || [],
    imagePosition: product.image_position || 'center',
    semantic: product.semantic_metadata || undefined,
    stock: product.stock_quantity,
    rating: Number(product.rating),
    reviewCount: product.review_count,
  }
}

export async function getProductData(idOrSlug: string): Promise<Product | null> {
  return fetchProductFromDB(idOrSlug)
}

/** Fetch all products from the database */
export async function getAllProducts(): Promise<Product[]> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?order=created_at.desc&select=*`

  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    next: { revalidate: 60, tags: ['products'] },
  })

  if (!res.ok) {
    console.error('getAllProducts error:', res.status, await res.text())
    return []
  }

  const rows = await res.json()
  return (rows as any[]).map(dbRowToProduct)
}

