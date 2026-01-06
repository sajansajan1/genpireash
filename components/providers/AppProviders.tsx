"use client";

import { RealtimeCreditsProvider } from "@/lib/providers/RealtimeCreditsProvider";
import { useUTMCapture } from "@/lib/analytics";

/**
 * Client-side app providers wrapper
 * This allows us to use client components in the root layout
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  // Capture UTM parameters from URL on app load
  // This enables campaign attribution for all analytics events
  useUTMCapture();

  return <RealtimeCreditsProvider>{children}</RealtimeCreditsProvider>;
}
