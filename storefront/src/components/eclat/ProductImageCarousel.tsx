'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  images: string[]
  alt: string
}

export function ProductImageCarousel({ images, alt }: Props) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = images.length

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % total)
  }, [total])

  const goTo = (i: number) => {
    setCurrent(i)
    // Reset auto-scroll timer when user manually navigates
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 4000)
  }

  // Auto-scroll every 4s
  useEffect(() => {
    if (total <= 1) return
    timerRef.current = setInterval(next, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [next, total])

  if (!images.length) return null

  return (
    <div className="relative w-full h-full group">
      {/* Main image */}
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + i}
          src={encodeURI(src)}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: 'center center' }}
        />
      ))}

      {/* Dot nav — only if multiple images */}
      {total > 1 && (
        <>
          {/* Left/right arrows */}
          <button
            onClick={() => goTo((current - 1 + total) % total)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/70 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={() => goTo((current + 1) % total)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/70 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-black w-4' : 'bg-black/30'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
