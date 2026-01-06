/**
 * Analytics Module
 *
 * Centralized analytics implementation using Google Tag Manager (GTM) as the hub.
 * GTM forwards events to:
 * - Amplitude (product analytics)
 * - Meta Pixel (advertising/conversion tracking)
 *
 * Usage:
 * ```typescript
 * import { track, AnalyticsEvents } from "@/lib/analytics";
 *
 * // Track a button click
 * track(AnalyticsEvents.CTA_CLICK, {
 *   button_name: "Get Started",
 *   location: "hero_section"
 * });
 * ```
 */

export {
  GoogleTagManager,
  GoogleTagManagerNoscript,
  pushToDataLayer,
  initDataLayer,
} from "./gtm";

export {
  AnalyticsEvents,
  type AnalyticsEvent,
  type CTAClickProperties,
  type FormSubmitProperties,
  type DesignEventProperties,
  type PurchaseProperties,
  type ErrorProperties,
} from "./events";

export { useAnalytics } from "./useAnalytics";

// UTM/Campaign tracking utilities
export {
  captureUTMParameters,
  getSessionUTM,
  getFirstTouchUTM,
  getUTMForAnalytics,
  getUTMEventProperties,
  clearUTMParameters,
  isFromCampaign,
  isFromSource,
  type UTMParameters,
} from "./utm";

export { useUTMCapture, useCampaignData } from "./useUTMCapture";

/**
 * Unified tracking function
 * Pushes events to GTM dataLayer which forwards to all configured analytics platforms
 * Automatically includes UTM/campaign parameters for attribution
 *
 * @param eventName - The event name (use AnalyticsEvents constants)
 * @param properties - Optional event properties/metadata
 * @param options - Optional configuration
 * @param options.includeUTM - Whether to include UTM parameters (default: true for conversion events)
 *
 * @example
 * ```typescript
 * track(AnalyticsEvents.SIGNUP_COMPLETE, { method: "email" });
 * track(AnalyticsEvents.PURCHASE, { value: 99.99, currency: "USD" });
 * ```
 */
export function track(
  eventName: string,
  properties?: Record<string, unknown>,
  options?: { includeUTM?: boolean }
): void {
  if (typeof window === "undefined") return;

  // Determine if we should include UTM parameters
  // Default to true for conversion events
  const conversionEvents = [
    "signup_start",
    "signup_complete",
    "login",
    "lead",
    "initiate_checkout",
    "purchase",
    "subscribe",
    "design_start",
    "design_complete",
    "techpack_generate",
  ];
  const shouldIncludeUTM =
    options?.includeUTM ?? conversionEvents.includes(eventName.toLowerCase());

  // Get UTM parameters if needed
  let utmProperties: Record<string, unknown> = {};
  if (shouldIncludeUTM) {
    try {
      const { getUTMEventProperties } = require("./utm");
      utmProperties = getUTMEventProperties() || {};
    } catch {
      // UTM module not available, continue without
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...utmProperties,
    ...properties,
    timestamp: new Date().toISOString(),
  });

  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, { ...utmProperties, ...properties });
  }
}

/**
 * Track page views with optional properties
 * Use this for client-side navigation tracking
 */
export function trackPageView(path?: string, properties?: Record<string, unknown>): void {
  track("page_view", {
    page_path: path || (typeof window !== "undefined" ? window.location.pathname : ""),
    page_title: typeof document !== "undefined" ? document.title : "",
    page_url: typeof window !== "undefined" ? window.location.href : "",
    ...properties,
  });
}

/**
 * Identify a user for analytics platforms
 * This pushes user data to the dataLayer for GTM to forward to Amplitude/Meta
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "user_identify",
    user_id: userId,
    ...traits,
  });
}

/**
 * Reset user identification (e.g., on logout)
 */
export function resetUser(): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "user_reset",
    user_id: null,
  });
}
