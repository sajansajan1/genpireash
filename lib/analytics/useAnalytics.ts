"use client";

import { useCallback } from "react";
import { track, trackPageView, identifyUser, resetUser, AnalyticsEvents } from "./index";

/**
 * Custom hook for analytics tracking
 * Provides memoized tracking functions for use in React components
 *
 * @example
 * ```typescript
 * const { trackEvent, trackCTA } = useAnalytics();
 *
 * // Track a custom event
 * trackEvent(AnalyticsEvents.DESIGN_START, { category: "shoes" });
 *
 * // Track a CTA click
 * trackCTA("Get Started", "hero_section");
 * ```
 */
export function useAnalytics() {
  /**
   * Track any custom event
   */
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      track(eventName, properties);
    },
    []
  );

  /**
   * Track CTA button clicks
   */
  const trackCTA = useCallback(
    (buttonName: string, location: string, destinationUrl?: string) => {
      track(AnalyticsEvents.CTA_CLICK, {
        button_name: buttonName,
        location,
        destination_url: destinationUrl,
      });
    },
    []
  );

  /**
   * Track form submissions
   */
  const trackFormSubmit = useCallback(
    (formName: string, success: boolean = true, formId?: string) => {
      track(AnalyticsEvents.FORM_SUBMIT, {
        form_name: formName,
        form_id: formId,
        success,
      });
    },
    []
  );

  /**
   * Track page views (useful for client-side navigation)
   */
  const trackPage = useCallback(
    (path?: string, properties?: Record<string, unknown>) => {
      trackPageView(path, properties);
    },
    []
  );

  /**
   * Identify a user for analytics
   */
  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      identifyUser(userId, traits);
    },
    []
  );

  /**
   * Reset user identification (e.g., on logout)
   */
  const reset = useCallback(() => {
    resetUser();
  }, []);

  /**
   * Track design-related events
   */
  const trackDesign = useCallback(
    (
      action: "start" | "complete" | "save" | "share",
      properties?: Record<string, unknown>
    ) => {
      const eventMap = {
        start: AnalyticsEvents.DESIGN_START,
        complete: AnalyticsEvents.DESIGN_COMPLETE,
        save: AnalyticsEvents.DESIGN_SAVE,
        share: AnalyticsEvents.DESIGN_SHARE,
      };
      track(eventMap[action], properties);
    },
    []
  );

  /**
   * Track tech pack events
   */
  const trackTechPack = useCallback(
    (action: "generate" | "download", properties?: Record<string, unknown>) => {
      const eventMap = {
        generate: AnalyticsEvents.TECHPACK_GENERATE,
        download: AnalyticsEvents.TECHPACK_DOWNLOAD,
      };
      track(eventMap[action], properties);
    },
    []
  );

  /**
   * Track AI-related events
   */
  const trackAI = useCallback(
    (
      action: "prompt_submit" | "generation_start" | "generation_complete" | "generation_error",
      properties?: Record<string, unknown>
    ) => {
      const eventMap = {
        prompt_submit: AnalyticsEvents.AI_PROMPT_SUBMIT,
        generation_start: AnalyticsEvents.AI_GENERATION_START,
        generation_complete: AnalyticsEvents.AI_GENERATION_COMPLETE,
        generation_error: AnalyticsEvents.AI_GENERATION_ERROR,
      };
      track(eventMap[action], properties);
    },
    []
  );

  /**
   * Track conversion events (leads, signups, purchases)
   */
  const trackConversion = useCallback(
    (
      type: "lead" | "signup_start" | "signup_complete" | "purchase",
      properties?: Record<string, unknown>
    ) => {
      const eventMap = {
        lead: AnalyticsEvents.LEAD,
        signup_start: AnalyticsEvents.SIGNUP_START,
        signup_complete: AnalyticsEvents.SIGNUP_COMPLETE,
        purchase: AnalyticsEvents.PURCHASE,
      };
      track(eventMap[type], properties);
    },
    []
  );

  return {
    // Core tracking
    trackEvent,
    trackPage,
    identify,
    reset,

    // Convenience methods
    trackCTA,
    trackFormSubmit,
    trackDesign,
    trackTechPack,
    trackAI,
    trackConversion,

    // Re-export events for easy access
    AnalyticsEvents,
  };
}
