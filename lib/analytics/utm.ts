"use client";

/**
 * UTM Parameter Tracking
 *
 * Captures and persists UTM parameters from marketing campaigns.
 * UTM parameters are stored in sessionStorage and localStorage for attribution.
 *
 * Standard UTM Parameters:
 * - utm_source: Identifies which site sent the traffic (e.g., google, facebook, newsletter)
 * - utm_medium: Identifies the marketing medium (e.g., cpc, email, social)
 * - utm_campaign: Identifies the specific campaign (e.g., summer_sale, product_launch)
 * - utm_term: Identifies paid search keywords (optional)
 * - utm_content: Differentiates similar content or links (optional)
 *
 * Additional Parameters:
 * - utm_id: Campaign ID for tracking specific campaigns
 * - gclid: Google Click ID for Google Ads
 * - fbclid: Facebook Click ID for Facebook Ads
 * - ref: Referral code
 */

export interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  gclid?: string;
  fbclid?: string;
  ref?: string;
  landing_page?: string;
  referrer?: string;
  timestamp?: string;
}

const UTM_STORAGE_KEY = "genpire_utm_params";
const UTM_SESSION_KEY = "genpire_utm_session";

/**
 * Capture UTM parameters from current URL
 * Should be called on app initialization
 */
export function captureUTMParameters(): UTMParameters | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);

  // Check if any UTM parameters exist
  const hasUTM = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "gclid",
    "fbclid",
    "ref",
  ].some((param) => urlParams.has(param));

  if (!hasUTM) return null;

  const utmParams: UTMParameters = {
    utm_source: urlParams.get("utm_source") || undefined,
    utm_medium: urlParams.get("utm_medium") || undefined,
    utm_campaign: urlParams.get("utm_campaign") || undefined,
    utm_term: urlParams.get("utm_term") || undefined,
    utm_content: urlParams.get("utm_content") || undefined,
    utm_id: urlParams.get("utm_id") || undefined,
    gclid: urlParams.get("gclid") || undefined,
    fbclid: urlParams.get("fbclid") || undefined,
    ref: urlParams.get("ref") || undefined,
    landing_page: window.location.pathname,
    referrer: document.referrer || undefined,
    timestamp: new Date().toISOString(),
  };

  // Remove undefined values
  Object.keys(utmParams).forEach((key) => {
    if (utmParams[key as keyof UTMParameters] === undefined) {
      delete utmParams[key as keyof UTMParameters];
    }
  });

  // Store in both session and local storage
  // Session: for current visit attribution
  // Local: for first-touch attribution (doesn't overwrite)
  try {
    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utmParams));

    // Only store in localStorage if no existing first-touch data
    if (!localStorage.getItem(UTM_STORAGE_KEY)) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    }
  } catch (e) {
    console.warn("[UTM] Storage not available:", e);
  }

  return utmParams;
}

/**
 * Get current session UTM parameters (last-touch attribution)
 */
export function getSessionUTM(): UTMParameters | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(UTM_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Get first-touch UTM parameters (original campaign that brought the user)
 */
export function getFirstTouchUTM(): UTMParameters | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Get UTM parameters for analytics events
 * Returns both first-touch and last-touch for complete attribution
 */
export function getUTMForAnalytics(): {
  first_touch?: UTMParameters;
  last_touch?: UTMParameters;
  campaign?: string;
  source?: string;
  medium?: string;
} {
  const firstTouch = getFirstTouchUTM();
  const lastTouch = getSessionUTM();

  // Use last-touch for primary attribution, fallback to first-touch
  const primary = lastTouch || firstTouch;

  return {
    first_touch: firstTouch || undefined,
    last_touch: lastTouch || undefined,
    campaign: primary?.utm_campaign,
    source: primary?.utm_source,
    medium: primary?.utm_medium,
  };
}

/**
 * Get flattened UTM parameters for event properties
 * Prefixes all keys with "utm_" or "campaign_" for clarity
 */
export function getUTMEventProperties(): Record<string, string | undefined> {
  const { first_touch, last_touch } = getUTMForAnalytics();
  const primary = last_touch || first_touch;

  if (!primary) return {};

  return {
    // Primary campaign info (most relevant for attribution)
    campaign_source: primary.utm_source,
    campaign_medium: primary.utm_medium,
    campaign_name: primary.utm_campaign,
    campaign_term: primary.utm_term,
    campaign_content: primary.utm_content,
    campaign_id: primary.utm_id,

    // Click IDs for ad platform attribution
    gclid: primary.gclid,
    fbclid: primary.fbclid,

    // Referral tracking
    referral_code: primary.ref,
    landing_page: primary.landing_page,
    referrer: primary.referrer,

    // Attribution type
    attribution_type: last_touch ? "last_touch" : "first_touch",
  };
}

/**
 * Clear stored UTM parameters (e.g., after conversion)
 */
export function clearUTMParameters(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(UTM_SESSION_KEY);
    // Note: We don't clear localStorage to maintain first-touch attribution
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if user came from a specific campaign
 */
export function isFromCampaign(campaignName: string): boolean {
  const { campaign } = getUTMForAnalytics();
  return campaign?.toLowerCase() === campaignName.toLowerCase();
}

/**
 * Check if user came from a specific source
 */
export function isFromSource(sourceName: string): boolean {
  const { source } = getUTMForAnalytics();
  return source?.toLowerCase() === sourceName.toLowerCase();
}
