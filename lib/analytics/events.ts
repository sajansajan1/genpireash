/**
 * Centralized analytics event definitions
 * These events are pushed to GTM dataLayer and forwarded to:
 * - Amplitude (product analytics)
 * - Meta Pixel (advertising/conversion tracking)
 */

export const AnalyticsEvents = {
  // Page Events
  PAGE_VIEW: "page_view",

  // User Actions
  CTA_CLICK: "cta_click",
  BUTTON_CLICK: "button_click",
  LINK_CLICK: "link_click",
  FORM_START: "form_start",
  FORM_SUBMIT: "form_submit",
  FORM_ERROR: "form_error",

  // Navigation
  NAV_CLICK: "nav_click",
  TAB_CHANGE: "tab_change",
  MODAL_OPEN: "modal_open",
  MODAL_CLOSE: "modal_close",

  // Conversion Events (Meta Pixel standard events)
  LEAD: "lead",
  SIGNUP_START: "signup_start",
  SIGNUP_COMPLETE: "signup_complete",
  LOGIN: "login",
  COMPLETE_REGISTRATION: "complete_registration",

  // Content Engagement
  VIEW_CONTENT: "view_content",
  SEARCH: "search",
  SHARE: "share",
  DOWNLOAD: "download",

  // Product/Design Events (Genpire specific)
  DESIGN_START: "design_start",
  DESIGN_COMPLETE: "design_complete",
  TECHPACK_GENERATE: "techpack_generate",
  TECHPACK_DOWNLOAD: "techpack_download",
  DESIGN_SAVE: "design_save",
  DESIGN_SHARE: "design_share",

  // AI Features
  AI_PROMPT_SUBMIT: "ai_prompt_submit",
  AI_GENERATION_START: "ai_generation_start",
  AI_GENERATION_COMPLETE: "ai_generation_complete",
  AI_GENERATION_ERROR: "ai_generation_error",

  // Subscription/Payment Events
  INITIATE_CHECKOUT: "initiate_checkout",
  ADD_PAYMENT_INFO: "add_payment_info",
  PURCHASE: "purchase",
  SUBSCRIBE: "subscribe",
  SUBSCRIPTION_CANCEL: "subscription_cancel",

  // Onboarding
  ONBOARDING_START: "onboarding_start",
  ONBOARDING_STEP: "onboarding_step",
  ONBOARDING_COMPLETE: "onboarding_complete",
  ONBOARDING_SKIP: "onboarding_skip",

  // Errors
  ERROR: "error",
  API_ERROR: "api_error",
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Common event property interfaces for type safety
 */
export interface CTAClickProperties {
  button_name: string;
  location: string;
  destination_url?: string;
}

export interface FormSubmitProperties {
  form_name: string;
  form_id?: string;
  success?: boolean;
}

export interface DesignEventProperties {
  design_id?: string;
  design_type?: string;
  category?: string;
}

export interface PurchaseProperties {
  transaction_id: string;
  value: number;
  currency: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}

export interface ErrorProperties {
  error_message: string;
  error_code?: string;
  error_location?: string;
}
