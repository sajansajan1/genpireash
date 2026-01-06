"use client";

import Script from "next/script";

interface GoogleTagManagerProps {
  gtmId?: string;
}

/**
 * Google Tag Manager script component
 * Loads GTM asynchronously after page becomes interactive
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const id = gtmId || process.env.NEXT_PUBLIC_GTM_ID;

  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("GTM ID not configured. Set NEXT_PUBLIC_GTM_ID environment variable.");
    }
    return null;
  }

  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${id}');
        `,
      }}
    />
  );
}

/**
 * GTM noscript fallback for users with JavaScript disabled
 * Should be placed immediately after the opening <body> tag
 */
export function GoogleTagManagerNoscript({ gtmId }: GoogleTagManagerProps) {
  const id = gtmId || process.env.NEXT_PUBLIC_GTM_ID;

  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

/**
 * Push custom events to GTM dataLayer
 * GTM will forward these events to configured tags (Amplitude, Meta Pixel, etc.)
 */
export function pushToDataLayer(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...data,
    });
  }
}

/**
 * Initialize dataLayer with default values
 * Call this early in the page lifecycle if needed
 */
export function initDataLayer() {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
  }
}
