import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Factory-Ready Products with AI | Genpire",
  description:
    "Create real, factory-ready products using AI. Generate designs, tech packs, and production files from prompts or sketches — all in one platform.",
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
