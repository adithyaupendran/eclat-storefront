"use client";

/**
 * NudgeBar — animated top banner that appears after 3s page time.
 * Carries the StorefrontPayload's nudgeMessage and matches the current theme.
 * Dismissible. Never shown if nudgeMessage is null.
 */

import { useEffect, useState } from "react";
import { useStorefrontPayload, useBehavioralSignals } from "@/store/storefrontStore";

export function NudgeBar() {
  const payload = useStorefrontPayload();
  const signals = useBehavioralSignals();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show after 3 seconds on page
  useEffect(() => {
    if (signals.pageTimeSeconds >= 3 && payload?.nudgeMessage && !dismissed) {
      setVisible(true);
    }
  }, [signals.pageTimeSeconds, payload?.nudgeMessage, dismissed]);

  // Reset dismissal when message changes (new scenario triggered)
  const message = payload?.nudgeMessage;
  useEffect(() => {
    setDismissed(false);
    setVisible(false);
  }, [message]);

  if (!visible || !payload?.nudgeMessage) return null;

  const isRain = payload.colorScheme === "monsoon";
  const isNight = payload.colorScheme === "night";

  const barClasses = isRain
    ? "bg-blue-950/90 border-b border-blue-800/60 text-blue-200"
    : isNight
    ? "bg-violet-950/90 border-b border-violet-800/60 text-violet-200"
    : "bg-amber-950/90 border-b border-amber-700/60 text-amber-200";

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 animate-nudge-in ${barClasses}`}
      role="alert"
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1 text-center">
          {payload.nudgeMessage}
        </p>
        <button
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
