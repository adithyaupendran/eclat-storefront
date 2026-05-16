"use client";
/**
 * EclatNudgeStrip — editorial nudge bar.
 * Slides in after 3s. Monochromatic (black bar, white text).
 * Only shown when storefrontPayload has a nudgeMessage.
 * Dismissible.
 */
import { useState, useEffect } from "react";
import { useStorefrontPayload, useBehavioralSignals } from "@/store/storefrontStore";

export function EclatNudgeStrip() {
  const payload = useStorefrontPayload();
  const signals = useBehavioralSignals();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const message = payload?.nudgeMessage;

  useEffect(() => {
    setDismissed(false);
    setVisible(false);
  }, [message]);

  useEffect(() => {
    if (signals.pageTimeSeconds >= 3 && message && !dismissed) {
      setVisible(true);
    }
  }, [signals.pageTimeSeconds, message, dismissed]);

  if (!visible || !message) return null;

  return (
    <div
      className="fixed top-14 inset-x-0 z-40 eclat-nudge-in eclat-surface-dark"
      role="alert"
    >
      <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-center justify-between">
        <p className="eclat-label text-[#e2e2e2] flex-1 text-center">
          {message}
        </p>
        <button
          onClick={() => { setVisible(false); setDismissed(true); }}
          className="eclat-label text-[#e2e2e2]/60 hover:text-[#e2e2e2] shrink-0 ml-4 transition-colors"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
