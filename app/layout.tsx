import type React from "react";
import type { Metadata } from "next";
import { Inter, Volkhov } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CustomToastProvider } from "@/components/ui/custom-toast-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GlobalLoadingOverlay } from "@/components/ui/global-loading-overlay";
import UserContext from "../components/messages/session";
import { createClient } from "@/lib/supabase/server";
import TawkToScript from "./tawktoscript";
import Script from "next/script";
import { LogRocketProvider } from "@/components/providers/logrocket-provider";
import { AppProviders } from "@/components/providers/AppProviders";
import { ImageViewerModal } from "@/modules/ai-designer/components/ImageViewerModal";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/lib/analytics";

const inter = Inter({ subsets: ["latin"] });
const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AI Tech Pack Generator for Factory-Ready Products | Genpire",
    template: "%s | Genpire",
  },
  description:
    "Turn prompts or sketches into factory-ready designs, tech packs and product specifications in minutes. Genpire is an AI-native platform for product creation and manufacturing workflows.",
  keywords: [
    "ai tech pack generator",
    "tech pack maker",
    "tech pack generator",
    "ai tech pack",
    "generate tech pack",
    "tech pack designer",
    "ai techpack generator",
    "tech pack creation tool",
    "fashion tech pack generator",
    "product specification generator",
    "manufacturing tech pack",
    "ai fashion design",
    "tech pack software",
    "product development tool",
    "technical specification generator",
    "fashion design software",
    "apparel tech pack",
    "clothing tech pack generator",
    "product design tool",
    "manufacturing specifications",
  ].join(", "),
  authors: [{ name: "Genpire Team" }],
  creator: "Genpire",
  publisher: "Genpire",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://genpire.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://genpire.com",
    siteName: "Genpire - AI Tech Pack Generator",
    title: "AI Tech Pack Generator for Factory-Ready Products | Genpire",
    description:
      "Turn prompts or sketches into factory-ready designs, tech packs and product specifications in minutes. Genpire is an AI-native platform for product creation and manufacturing workflows.",
    images: [
      {
        url: "https://genpire.com/genpireurl.png",
        width: 1200,
        height: 630,
        alt: "Genpire AI Tech Pack Generator Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tech Pack Generator for Factory-Ready Products | Genpire",
    description:
      "Turn prompts or sketches into factory-ready designs, tech packs and product specifications in minutes. Genpire is an AI-native platform for product creation and manufacturing workflows.",
    images: ["https://genpire.com/genpireurl.png"],
    creator: "@genpire",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const canInitSupabaseClient = () => {
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  if (isSupabaseConnected) console.log("supabase is connected successfully");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="referrer" content="origin" />
        <link rel="canonical" href="https://genpire.com" />
        <meta property="og:image" content="https://genpire.com/genpireurl.png" />
        {/* Google Tag Manager - Central hub for Amplitude and Meta Pixel */}
        <GoogleTagManager />
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Genpire AI Tech Pack Generator",
              description:
                "AI-powered tech pack generator that creates professional product specifications, technical drawings, and manufacturing documents in minutes.",
              url: "https://genpire.ai",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free AI tech pack generation",
              },
              creator: {
                "@type": "Organization",
                name: "Genpire",
                url: "https://genpire.ai",
              },
              featureList: [
                "AI Tech Pack Generation",
                "Technical Specifications",
                "Material Lists",
                "Color Palettes",
                "Sizing Charts",
                "Manufacturing Instructions",
                "Supplier Matching",
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {/* GTM noscript fallback */}
        <GoogleTagManagerNoscript />
        <LogRocketProvider>
          <UserContext>
            <AppProviders>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                {children}
                <CustomToastProvider />
                <ToastContainer />
                <GlobalLoadingOverlay />
                <ImageViewerModal />
              </ThemeProvider>
            </AppProviders>
          </UserContext>
        </LogRocketProvider>
      </body>
    </html>
  );
}
