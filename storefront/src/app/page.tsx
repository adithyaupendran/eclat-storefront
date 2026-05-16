import { EclatNav } from "@/components/eclat/EclatNav";
import { EclatNudgeStrip } from "@/components/eclat/EclatNudgeStrip";
import { EclatHero } from "@/components/eclat/EclatHero";
import { EclatProductGrid } from "@/components/eclat/EclatProductGrid";
import { EclatQuoteBlock } from "@/components/eclat/EclatQuoteBlock";
import { EclatFooter } from "@/components/eclat/EclatFooter";
import { getAllProducts } from "@/lib/data/products";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <>
      <EclatNav />
      <main className="pt-14">
        <EclatNudgeStrip />
        <EclatHero />
        <EclatProductGrid products={products} />
        <EclatQuoteBlock />
        <EclatFooter />
      </main>
    </>
  );
}
