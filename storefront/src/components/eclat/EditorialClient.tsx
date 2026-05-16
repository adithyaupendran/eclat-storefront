"use client";

import React, { useState } from "react";
import Link from "next/link";
import { type Product } from "@/lib/mock/catalog";

interface Props {
  products: Product[]
  heading: string
  subheading: string
}

export function EditorialClient({ products, heading, subheading }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm tracking-widest text-gray-400">
        No editorial products selected.
        <br />
        <Link href="/admin/editorial" className="mt-2 underline">Configure in admin →</Link>
      </div>
    )
  }

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % products.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.clientX > window.innerWidth / 2) handleNext(); else handlePrev();
  };

  const current = products[currentIndex];

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-white text-black relative cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Top nav */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-8 text-[0.65rem] tracking-widest font-medium uppercase font-sans z-10">
        <div className="w-1/3 text-left">
          <Link href="/" onClick={(e) => e.stopPropagation()} className="hover:text-gray-500 transition-colors">
            ÉCLAT
          </Link>
        </div>
        <div className="w-1/3 text-center text-gray-500">
          <span className="text-black font-semibold">{heading}</span> {subheading}
        </div>
        <div className="w-1/3 text-right flex justify-end items-center gap-6">
          <div className="text-gray-400">
            {String(currentIndex + 1).padStart(2, "0")} | {String(products.length).padStart(2, "0")}
          </div>
          <Link href="/about" onClick={(e) => e.stopPropagation()} className="hover:text-black transition-colors">[ ABOUT ]</Link>
        </div>
      </div>

      {/* Image */}
      <div className="flex-grow flex items-center justify-center p-6 pt-24 pb-6 overflow-hidden">
        <Link
          href={`/products/${current.id}`}
          onClick={(e) => e.stopPropagation()}
          className="relative h-[65vh] max-h-[600px] aspect-[3/4] max-w-full block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(current.imageUrl)}
            alt={current.name}
            className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
          />

        </Link>
      </div>
    </div>
  );
}
