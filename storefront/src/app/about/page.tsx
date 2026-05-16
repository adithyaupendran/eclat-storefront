import { EclatNav } from "@/components/eclat/EclatNav";
import { EclatFooter } from "@/components/eclat/EclatFooter";

export default function AboutPage() {
  return (
    <>
      <EclatNav />
      <main className="pt-14 min-h-screen bg-white text-black">

        {/* Sticky section nav */}
        <nav className="sticky top-14 z-30 bg-white border-b border-[rgba(0,0,0,0.06)]">
          <div className="max-w-screen-md mx-auto px-8">
            <ul className="flex gap-8 overflow-x-auto py-4 text-[0.65rem] tracking-widest scrollbar-none">
              {[
                { label: 'ABOUT', href: '#about' },
                { label: 'SUSTAINABILITY', href: '#sustainability' },
                { label: 'SHIPPING & RETURNS', href: '#shipping' },
                { label: 'CONTACT', href: '#contact' },
              ].map(({ label, href }) => (
                <li key={label} className="shrink-0">
                  <a href={href} className="hover:text-black transition-colors" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ── ABOUT ──────────────────────────────────────────────────────── */}
        <section id="about" className="max-w-screen-md mx-auto px-8 py-32 scroll-mt-28">
          <p className="eclat-label mb-8 tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>ABOUT ÉCLAT</p>
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Dressed for
            <br />those who
            <br /><em>remain</em>.
          </h1>
        </section>

        <div className="max-w-screen-md mx-auto px-8"><div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} /></div>

        <section className="max-w-screen-md mx-auto px-8 py-24 grid md:grid-cols-2 gap-16">
          <div>
            <p className="eclat-label mb-6 tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>PHILOSOPHY</p>
            <p className="eclat-body leading-relaxed" style={{ fontSize: '1.0625rem', lineHeight: 1.8 }}>
              ÉCLAT was founded on the belief that luxury is not loudness.
              It is restraint. It is the weight of a fabric, the silence of a silhouette,
              the decision to remove rather than add.
            </p>
          </div>
          <div>
            <p className="eclat-label mb-6 tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>PROCESS</p>
            <p className="eclat-body leading-relaxed" style={{ fontSize: '1.0625rem', lineHeight: 1.8 }}>
              Each piece begins as a question: what remains when everything unnecessary is gone?
              The answer is ÉCLAT — a single garment that needs no explanation,
              no occasion, no context. Only presence.
            </p>
          </div>
        </section>

        <div className="max-w-screen-md mx-auto px-8"><div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} /></div>

        <section className="max-w-screen-md mx-auto px-8 py-24 grid grid-cols-3 gap-8 text-center">
          {[
            { num: '2019', label: 'Founded' },
            { num: '004', label: 'Collections' },
            { num: '∞', label: 'Iterations rejected' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-noto-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300 }}>{num}</p>
              <p className="eclat-label mt-2" style={{ color: 'rgba(0,0,0,0.35)' }}>{label.toUpperCase()}</p>
            </div>
          ))}
        </section>

        <div className="max-w-screen-md mx-auto px-8"><div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} /></div>

        <section className="max-w-screen-md mx-auto px-8 py-24">
          <p className="eclat-body" style={{ fontFamily: 'var(--font-noto-serif)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.9, color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
            "We do not chase trends. We observe them, wait for them to exhaust themselves,
            and then we make the thing that was always there beneath."
          </p>
          <p className="eclat-label mt-4" style={{ color: 'rgba(0,0,0,0.25)' }}>— ÉCLAT ATELIER, COLLECTION 004 NOTES</p>
        </section>

        {/* ── SUSTAINABILITY ─────────────────────────────────────────────── */}
        <div className="max-w-screen-md mx-auto px-8"><div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} /></div>

        <section id="sustainability" className="max-w-screen-md mx-auto px-8 py-32 scroll-mt-28">
          <p className="eclat-label mb-8 tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>SUSTAINABILITY</p>
          <h2 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '2.5rem' }}>
            Less, but better.
          </h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="eclat-label mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>MATERIALS</p>
              <p className="eclat-body" style={{ lineHeight: 1.9 }}>
                Every fabric in ÉCLAT is sourced from certified mills that meet strict environmental standards.
                We use deadstock fabric whenever possible, eliminating waste before it begins.
                Natural fibres — silk, wool, organic cotton — are our default.
              </p>
            </div>
            <div>
              <p className="eclat-label mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>PRODUCTION</p>
              <p className="eclat-body" style={{ lineHeight: 1.9 }}>
                We produce in small batches. No overstock. No seasonal clearance.
                Each garment is made to outlast the concept of a "trend."
                We refuse to manufacture demand that doesn't exist.
              </p>
            </div>
            <div>
              <p className="eclat-label mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>PACKAGING</p>
              <p className="eclat-body" style={{ lineHeight: 1.9 }}>
                All packaging is compostable or recycled. No plastic. No excess.
                Garments ship in unbleached cotton dust bags you'll keep forever.
              </p>
            </div>
            <div>
              <p className="eclat-label mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>LONGEVITY</p>
              <p className="eclat-body" style={{ lineHeight: 1.9 }}>
                We offer complimentary repair for every ÉCLAT piece, indefinitely.
                A garment that lasts is the most sustainable garment.
              </p>
            </div>
          </div>
        </section>

        {/* ── SHIPPING & RETURNS ─────────────────────────────────────────── */}
        <div className="max-w-screen-md mx-auto px-8"><div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} /></div>

        <section id="shipping" className="max-w-screen-md mx-auto px-8 py-32 scroll-mt-28">
          <p className="eclat-label mb-8 tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>SHIPPING & RETURNS</p>
          <h2 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '2.5rem' }}>
            Delivered with care.
          </h2>
          <div className="grid md:grid-cols-2 gap-16">
            {[
              {
                title: 'DOMESTIC (INDIA)',
                lines: [
                  'Standard: 3–5 business days — Free',
                  'Express: 1–2 business days — ₹499',
                  'Same-day available in Mumbai, Delhi, Bengaluru',
                ],
              },
              {
                title: 'INTERNATIONAL',
                lines: [
                  'Standard: 7–14 business days — ₹1,200',
                  'Express DHL: 3–5 business days — ₹2,800',
                  'Duties and taxes are the responsibility of the recipient.',
                ],
              },
              {
                title: 'RETURNS',
                lines: [
                  'Returns accepted within 14 days of delivery.',
                  'Items must be unworn, unaltered, with all tags attached.',
                  'Email returns@eclat.com with your order number to begin.',
                ],
              },
              {
                title: 'EXCHANGES',
                lines: [
                  'Exchanges for size or style are free of charge.',
                  'We will arrange collection of the original item.',
                  'New item ships within 2 business days of receipt.',
                ],
              },
            ].map(({ title, lines }) => (
              <div key={title}>
                <p className="eclat-label mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>{title}</p>
                <ul className="space-y-2">
                  {lines.map(line => (
                    <li key={line} className="eclat-body" style={{ lineHeight: 1.9 }}>— {line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ────────────────────────────────────────────────────── */}
        <div className="max-w-screen-md mx-auto px-8"><div style={{ height: '1px', background: 'rgba(0,0,0,0.08)' }} /></div>

        <section id="contact" className="max-w-screen-md mx-auto px-8 py-32 scroll-mt-28">
          <p className="eclat-label mb-8 tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>CONTACT</p>
          <h2 style={{ fontFamily: 'var(--font-noto-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '2.5rem' }}>
            We reply slowly,<br />but genuinely.
          </h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="flex flex-col gap-8">
              {[
                { label: 'GENERAL', value: 'hello@eclat.com' },
                { label: 'ORDERS & RETURNS', value: 'returns@eclat.com' },
                { label: 'PRESS & EDITORIAL', value: 'press@eclat.com' },
                { label: 'WHOLESALE', value: 'trade@eclat.com' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="eclat-label mb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>{label}</p>
                  <a href={`mailto:${value}`} className="eclat-body hover:opacity-50 transition-opacity" style={{ lineHeight: 1.9 }}>
                    {value}
                  </a>
                </div>
              ))}
            </div>
            <div>
              <p className="eclat-label mb-4" style={{ color: 'rgba(0,0,0,0.35)' }}>ATELIER</p>
              <p className="eclat-body" style={{ lineHeight: 2 }}>
                ÉCLAT Atelier<br />
                14, Regal Building<br />
                Connaught Place<br />
                New Delhi — 110 001<br />
                India
              </p>
              <p className="eclat-label mt-8 mb-2" style={{ color: 'rgba(0,0,0,0.35)' }}>HOURS</p>
              <p className="eclat-body" style={{ lineHeight: 2 }}>
                Monday – Saturday<br />
                11:00 — 19:00 IST<br />
                Closed Sunday
              </p>
            </div>
          </div>
        </section>

        <EclatFooter />
      </main>
    </>
  );
}
