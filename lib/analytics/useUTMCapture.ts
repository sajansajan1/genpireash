"use client";

import { useEffect } from "react";
import { captureUTMParameters, getUTMForAnalytics } from "./utm";
import { pushToDataLayer } from "./gtm";

/**
 * Hook to capture UTM parameters on component mount
 * Use this in your root layout or app component
 *
 * @example
 * ```tsx
 * // In app/layout.tsx or a provider component
 * function RootLayout({ children }) {
 *   useUTMCapture();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useUTMCapture() {
  useEffect(() => {
    // Capture UTM parameters from URL
    const utmParams = captureUTMParameters();

    // If UTM parameters were captured, push to dataLayer for GTM
    if (utmParams) {
      pushToDataLayer("utm_captured", {
        ...utmParams,
        event_category: "campaign",
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] UTM Parameters captured:", utmParams);
      }
    }
  }, []);
}

/**
 * Hook to get current UTM/campaign data
 * Returns memoized UTM parameters for use in components
 *
 * @example
 * ```tsx
 * function SignupForm() {
 *   const { campaign, source } = useCampaignData();
 *
 *   const handleSignup = () => {
 *     track(AnalyticsEvents.SIGNUP_COMPLETE, {
 *       campaign,
 *       source,
 *       // ... other data
 *     });
 *   };
 * }
 * ```
 */
export function useCampaignData() {
  // Get UTM data - this is safe to call on every render
  // as it just reads from storage
  const utmData = getUTMForAnalytics();

  return {
    campaign: utmData.campaign,
    source: utmData.source,
    medium: utmData.medium,
    firstTouch: utmData.first_touch,
    lastTouch: utmData.last_touch,
    hasUTM: !!(utmData.campaign || utmData.source),
  };
}
