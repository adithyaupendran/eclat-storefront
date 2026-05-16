/**
 * EclatQuoteBlock — full-width italic serif editorial quote.
 * Static content. Section-divider between product blocks.
 */

interface EclatQuoteBlockProps {
  quote?: string;
  attribution?: string;
}

export function EclatQuoteBlock({
  quote = "Fashion is the most powerful art we have. It is how we present our souls to the world.",
  attribution,
}: EclatQuoteBlockProps) {
  return (
    <section
      className="w-full eclat-surface-low"
      style={{ padding: "var(--space-section) 2rem" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <blockquote
          style={{
            fontFamily: "var(--font-noto-serif)",
            fontSize: "clamp(1.25rem, 3vw, 2rem)",
            fontStyle: "italic",
            lineHeight: 1.5,
            color: "var(--eclat-on-surface)",
            fontWeight: 400,
          }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
        {attribution && (
          <cite
            className="mt-6 block eclat-label"
            style={{ fontStyle: "normal" }}
          >
            — {attribution}
          </cite>
        )}
      </div>
    </section>
  );
}
