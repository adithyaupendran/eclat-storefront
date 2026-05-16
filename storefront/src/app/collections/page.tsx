/**
 * /collections — ÉCLAT Collection Listing
 * Server component: fetches products from DB, passes to client for filtering.
 */

import { EclatNav } from "@/components/eclat/EclatNav";
import { EclatFooter } from "@/components/eclat/EclatFooter";
import { CollectionsClient } from "@/components/eclat/CollectionsClient";
import { getAllProducts } from "@/lib/data/products";

export default async function CollectionsPage() {
  const products = await getAllProducts();

  return (
    <>
      <EclatNav />
      <main className="pt-14">
        {/* Page header */}
        <section className="eclat-surface-dark" style={{ padding: "var(--space-section) 2rem 4rem" }}>
          <div className="max-w-screen-xl mx-auto">
            <p className="eclat-label text-[#e2e2e2]/40 mb-4">Collection 004</p>
            <h1
              className="text-[#e2e2e2]"
              style={{
                fontFamily: "var(--font-noto-serif)",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: 400,
                lineHeight: 1.0,
              }}
            >
              Quiet Elegance
              <br />
              <em>in Monochrome.</em>
            </h1>
          </div>
        </section>

        <CollectionsClient products={products} />

        <EclatFooter />
      </main>
    </>
  );
}
