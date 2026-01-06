/**
 * Global type declarations for analytics
 */

declare global {
  interface Window {
    /**
     * Google Tag Manager dataLayer
     * Used to push events and data to GTM
     */
    dataLayer: DataLayerObject[];

    /**
     * Google Analytics gtag function (legacy, for backward compatibility)
     */
    gtag?: (...args: unknown[]) => void;

    /**
     * Facebook Pixel fbq function (legacy, managed via GTM now)
     */
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * DataLayer object structure
 */
export interface DataLayerObject {
  event?: string;
  [key: string]: unknown;
}

/**
 * GTM Event structure
 */
export interface GTMEvent {
  event: string;
  timestamp?: string;
  [key: string]: unknown;
}

export {};
