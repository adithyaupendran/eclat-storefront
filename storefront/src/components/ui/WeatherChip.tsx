"use client";

/**
 * WeatherChip — floating environmental context badge.
 * Shows current weather condition, temperature, and city.
 * Pulses gently to draw attention without being distracting.
 */

import type { EnvironmentalPayload } from "@/lib/mock/environmental";

const WEATHER_ICONS: Record<string, string> = {
  heavy_rain: "🌧️",
  light_rain: "🌦️",
  sunny: "☀️",
  cloudy: "☁️",
  hot: "🥵",
  cold: "🥶",
  snow: "❄️",
};

const WEATHER_LABELS: Record<string, string> = {
  heavy_rain: "Heavy Rain",
  light_rain: "Light Rain",
  sunny: "Sunny",
  cloudy: "Cloudy",
  hot: "Hot",
  cold: "Cold",
  snow: "Snowfall",
};

interface WeatherChipProps {
  env: EnvironmentalPayload;
}

export function WeatherChip({ env }: WeatherChipProps) {
  const icon = WEATHER_ICONS[env.weather.condition] ?? "🌡️";
  const label = WEATHER_LABELS[env.weather.condition] ?? env.weather.condition;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 animate-glow-pulse">
      <span className="text-lg leading-none" role="img" aria-label={label}>
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-blue-300 text-xs font-semibold tracking-wide">
          {env.location.city} · {env.weather.temperatureCelsius}°C
        </span>
        <span className="text-slate-400 text-xs">{label}</span>
      </div>
    </div>
  );
}
