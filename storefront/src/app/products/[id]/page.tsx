/**
 * /products/[id] — ÉCLAT Product Detail Page
 * Balanced editorial layout: image left (50%), details right (50%).
 */

import { notFound } from "next/navigation";
import { EclatNav } from "@/components/eclat/EclatNav";
import { EclatFooter } from "@/components/eclat/EclatFooter";
import { getProductData } from "@/lib/data/products";
import { ProductInteractions } from "@/components/eclat/ProductInteractions";
import { ProductImageCarousel } from "@/components/eclat/ProductImageCarousel";

const IMG_CLASS: Record<string, string> = {
  outerwear: "eclat-img-outerwear",
  separates: "eclat-img-separates",
  footwear: "eclat-img-footwear",
  accessories: "eclat-img-accessories",
  sets: "eclat-img-sets",
};

interface Params { id: string }

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const product = await getProductData(id);
  if (!product) notFound();

  const imgClass = IMG_CLASS[product.category] ?? "eclat-img-default";
  const sizeStock: Record<string, number> = (product as any).size_stock ?? {};
  const images = product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : [])

  return (
    <>
      <EclatNav />
      <main className="pt-14">
        <div className="md:grid md:grid-cols-2 min-h-[75vh]">
          {/* ── Image carousel (50% width) ─────────────────────── */}
          <div className="relative overflow-hidden bg-[#f3f3f3]" style={{ minHeight: '55vh', maxHeight: '75vh' }}>
            {images.length > 0 ? (
              <ProductImageCarousel images={images} alt={product.name} />
            ) : (
              <div className={`w-full h-full ${imgClass}`} />
            )}
          </div>

          {/* ── Product details (50% width) ───────────────────────────────── */}
          <div
            className="eclat-surface-white px-10 py-14 md:px-16 flex flex-col justify-center overflow-y-auto"
            style={{ borderLeft: "1px solid rgba(0,0,0,0.04)", maxHeight: '90vh' }}
          >
            <p className="eclat-label mb-4">{product.brand} · {product.category}</p>

            <h1
              className="mb-6"
              style={{
                fontFamily: "var(--font-noto-serif)",
                fontSize: "clamp(1.6rem, 2.5vw, 2.25rem)",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "var(--eclat-on-surface)",
              }}
            >
              {product.name}
            </h1>

            <p className="eclat-body mb-8">{product.shortDescription}</p>

            {/* Price */}
            <div className="mb-8 flex items-baseline gap-4">
              <span style={{ fontFamily: "var(--font-inter)", fontSize: "1.25rem", color: "var(--eclat-on-surface)", fontWeight: 500 }}>
                ₹{product.priceINR.toLocaleString("en-IN")}
              </span>
              {product.originalPriceINR && (
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", color: "var(--eclat-variant)", textDecoration: "line-through" }}>
                  ₹{product.originalPriceINR.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Size selector + Add to cart */}
            <ProductInteractions
              productId={product.id}
              sizes={product.sizes ?? []}
              sizeStock={sizeStock}
              totalStock={product.stock}
            />

            {/* Composition */}
            <div className="mt-10" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1.5rem" }}>
              <p className="eclat-label mb-3">Composition</p>
              <div className="space-y-1">
                {product.tags.slice(0, 4).map((tag) => (
                  <p key={tag} className="eclat-label" style={{ color: "var(--eclat-on-surface)", letterSpacing: "0.06rem" }}>
                    {tag.toUpperCase()}
                  </p>
                ))}
              </div>
            </div>

            {/* Rating */}
            <p className="eclat-label mt-6">
              ★ {product.rating} · {product.reviewCount} reviews · {product.stock} in stock
            </p>
          </div>
        </div>

        <EclatFooter />
      </main>
    </>
  );
}
