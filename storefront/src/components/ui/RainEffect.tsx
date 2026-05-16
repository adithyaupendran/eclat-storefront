"use client";

/**
 * RainEffect — pure CSS animated rain overlay.
 * Renders N drops with random widths, heights, positions, and speeds.
 * Memoised — re-generates only when `intensity` prop changes.
 */

import { useMemo } from "react";

interface RainEffectProps {
  intensity?: "light" | "heavy";
  className?: string;
}

export function RainEffect({ intensity = "heavy", className = "" }: RainEffectProps) {
  const drops = useMemo(() => {
    const count = intensity === "heavy" ? 80 : 40;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      height: `${40 + Math.random() * 60}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${0.6 + Math.random() * 0.8}s`,
      opacity: 0.2 + Math.random() * 0.4,
    }));
  }, [intensity]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {drops.map((d) => (
        <span
          key={d.id}
          className="rain-drop"
          style={{
            left: d.left,
            height: d.height,
            opacity: d.opacity,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}
