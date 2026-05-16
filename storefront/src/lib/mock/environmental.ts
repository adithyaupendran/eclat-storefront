/**
 * Environmental Layer - Mock Data
 *
 * Simulates a server/edge fetch of local weather and time context.
 * Default location: Mangaluru, India — heavy monsoon scenario.
 *
 * In production this would call a weather API (e.g. OpenWeatherMap) at the
 * Next.js Edge Runtime before the page renders, so the storefront is already
 * adapted before the first byte reaches the client.
 */

export type WeatherCondition =
  | "heavy_rain"
  | "light_rain"
  | "sunny"
  | "cloudy"
  | "hot"
  | "cold"
  | "snow";

export type TimeOfDay = "dawn" | "morning" | "afternoon" | "evening" | "night";

export interface EnvironmentalPayload {
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
    timezone: string;
  };
  weather: {
    condition: WeatherCondition;
    temperatureCelsius: number;
    humidity: number; // 0-100
    windSpeedKmh: number;
    description: string;
    isOutdoor: boolean; // false = weather discourages going outside
  };
  time: {
    iso: string;
    timeOfDay: TimeOfDay;
    dayOfWeek: string;
    isWeekend: boolean;
  };
}

/** Returns simulated time-of-day bucket from the real local clock. */
function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * getEnvironmentalContext()
 *
 * Call this in a Next.js Server Component or Route Handler.
 * The weather data is hardcoded to the Mangaluru monsoon scenario for MVP.
 * The time data is derived from the real clock so UI theming stays
 * time-accurate even during development.
 */
export function getEnvironmentalContext(): EnvironmentalPayload {
  const now = new Date();
  // Convert UTC to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const hour = ist.getUTCHours();
  const day = ist.toLocaleDateString("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  });
  const isWeekend = ist.getUTCDay() === 0 || ist.getUTCDay() === 6;

  return {
    location: {
      city: "Mangaluru",
      country: "India",
      lat: 12.8698,
      lon: 74.8429,
      timezone: "Asia/Kolkata",
    },
    weather: {
      // ── Hardcoded monsoon scenario ──────────────────────────────────────
      condition: "heavy_rain",
      temperatureCelsius: 27,
      humidity: 94,
      windSpeedKmh: 22,
      description:
        "Heavy monsoon rain with strong gusty winds — typical June/July conditions along the Konkan coast.",
      isOutdoor: false,
    },
    time: {
      iso: ist.toISOString(),
      timeOfDay: getTimeOfDay(hour),
      dayOfWeek: day,
      isWeekend,
    },
  };
}

/**
 * FUTURE: Replace mock with real API call
 *
 * export async function getEnvironmentalContext(): Promise<EnvironmentalPayload> {
 *   const res = await fetch(
 *     `https://api.openweathermap.org/data/2.5/weather?lat=12.8698&lon=74.8429&appid=${process.env.OWM_API_KEY}&units=metric`,
 *     { next: { revalidate: 1800 } }   // 30-min cache at the Edge
 *   );
 *   const raw = await res.json();
 *   return transformOwmPayload(raw);
 * }
 */
