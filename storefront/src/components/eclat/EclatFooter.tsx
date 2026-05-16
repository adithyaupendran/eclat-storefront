/**
 * EclatFooter — editorial footer with nav links and brand footer.
 * No rounded corners, no borders — negative space only.
 */
import Link from "next/link";

const footerLinks = {
  Shop: ["Collections", "New Arrivals", "Archive", "Editorial"],
  Info: ["About", "Sustainability", "Shipping & Returns", "Contact"],
  Legal: ["Terms of Service", "Privacy Policy", "Cookie Preferences"],
};

export function EclatFooter() {
  return (
    <footer
      className="eclat-surface-dark"
      style={{ paddingTop: "var(--space-section)", paddingBottom: "4rem" }}
    >
      <div className="max-w-screen-xl mx-auto px-8">
        {/* Brand name */}
        <p
          className="text-[#e2e2e2]/20 mb-16 select-none"
          style={{
            fontFamily: "var(--font-noto-serif)",
            fontSize: "clamp(4rem, 12vw, 10rem)",
            lineHeight: 0.9,
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
          aria-hidden="true"
        >
          ÉCLAT
        </p>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-16">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="eclat-label text-[#e2e2e2]/40 mb-6">{section}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={
                        link === "Collections" ? "/collections" :
                        link === "Editorial" ? "/editorial" :
                        link === "About" ? "/about" :
                        link === "Sustainability" ? "/about#sustainability" :
                        link === "Shipping & Returns" ? "/about#shipping" :
                        link === "Contact" ? "/about#contact" :
                        "/"
                      }
                      className="eclat-body text-[#e2e2e2]/60 hover:text-[#e2e2e2] transition-colors"
                      style={{ fontFamily: "var(--font-inter)", color: "inherit" }}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="eclat-label text-[#e2e2e2]/30">
            © 2024 ÉCLAT. CRAFTED FOR THE DISCERNING.
          </p>
          <div className="flex gap-6">
            {["Preview →", "Engine →"].map((l, i) => (
              <Link
                key={l}
                href={i === 0 ? "/preview" : "/engine-test"}
                className="eclat-label text-[#e2e2e2]/20 hover:text-[#e2e2e2]/50 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
