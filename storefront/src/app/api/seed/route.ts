import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { PRODUCT_CATALOG } from '@/lib/mock/catalog'

export async function GET() {
  const supabase = await createAdminClient()

  // 1. Seed Products
  for (const product of PRODUCT_CATALOG) {
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      slug: product.id, // For simplicity, slug = id
      title: product.name,
      brand: product.brand,
      description: product.shortDescription,
      price: product.priceINR,
      original_price: product.originalPriceINR,
      category: product.category,
      image_urls: [product.imageUrl],
      image_position: product.imagePosition,
      tags: product.tags,
      sizes: product.sizes,
      semantic_metadata: product.semantic || {},
      stock_quantity: product.stock,
      rating: product.rating,
      review_count: product.reviewCount,
    })

    if (error) {
      console.error('Error seeding product:', product.id, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, message: 'Database seeded successfully.' })
}
