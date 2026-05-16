"use client";
/**
 * EclatNav — Glassmorphic navigation bar.
 * Fixed top. ÉCLAT logo centered. Links left on desktop.
 * "Search" opens EclatSearchOverlay (natural language search).
 */
import Link from "next/link";
import { useState, useEffect } from "react";
import { EclatSearchOverlay } from "@/components/eclat/EclatSearchOverlay";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";

export function EclatNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((s) => s.count);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    const syncCartCount = async (userId: string | null) => {
      if (!userId) {
        useCartStore.getState().setCartCount(0);
        return;
      }
      // Fetch real cart count from DB for this user
      const { count } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      useCartStore.getState().setCartCount(count ?? 0);
    };

    // Get initial session and sync
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      syncCartCount(data.user?.id ?? null);
    });

    // Listen for auth changes (login/logout) and re-sync
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      syncCartCount(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 eclat-nav border-b border-[rgba(0,0,0,0.06)]"
      >
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Mobile: hamburger */}
          <button
            className="md:hidden w-8 flex flex-col gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block h-px bg-black transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-px bg-black transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px bg-black transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

          {/* Desktop: left links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/collections" className="eclat-label hover:text-black transition-colors">
              Collections
            </Link>
            <Link href="/editorial" className="eclat-label hover:text-black transition-colors">
              Editorial
            </Link>
            <Link href="/" className="eclat-label hover:text-black transition-colors">
              Archive
            </Link>
          </nav>

          {/* Logo — center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 tracking-[0.25rem] text-black font-normal text-xl"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            ÉCLAT
          </Link>

          {/* Right: Search, Wishlist, Bag, Account */}
          <div className="flex items-center gap-5">
            {/* Desktop only items */}
            <button
              aria-label="Search"
              className="hidden md:block eclat-label hover:text-black transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              Search
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden md:block eclat-label hover:text-black">
              ♡
            </Link>
            {mounted && user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="hidden md:block eclat-label hover:text-black">
                    Admin
                  </Link>
                )}
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    useCartStore.getState().setCartCount(0)
                    window.location.href = '/'
                  }}
                  className="hidden md:block eclat-label hover:text-black transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" aria-label="Account" className="hidden md:block eclat-label hover:text-black">
                Sign In
              </Link>
            )}
            {/* Bag always visible */}
            <Link href="/bag" aria-label="Bag" className="eclat-label hover:text-black">
              Bag ({mounted ? cartCount : 0})
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#f9f9f9] pt-14 px-8 flex flex-col gap-8 md:hidden">
          {[
            { label: 'Collections', href: '/collections' },
            { label: 'Editorial', href: '/editorial' },
            { label: 'Archive', href: '/' },
            { label: 'About', href: '/about' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="eclat-headline text-black border-b border-[rgba(0,0,0,0.06)] pb-4"
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: 'var(--font-noto-serif)' }}
            >
              {label}
            </Link>
          ))}

          <button
            className="eclat-btn-primary text-left w-fit"
            onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
          >
            SEARCH THE COLLECTION
          </button>

          {/* Auth — always in drawer on mobile */}
          <div className="mt-auto pb-8 flex flex-col gap-4 border-t border-[rgba(0,0,0,0.06)] pt-6">
            {mounted && user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    className="eclat-label text-black hover:text-gray-500 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    useCartStore.getState().setCartCount(0)
                    setMenuOpen(false)
                    window.location.href = '/'
                  }}
                  className="eclat-label text-left text-black hover:text-gray-500 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="eclat-label text-black hover:text-gray-500 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Search overlay (full-screen) */}
      {searchOpen && (
        <EclatSearchOverlay onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}
