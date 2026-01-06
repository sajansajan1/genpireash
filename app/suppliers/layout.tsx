import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Suppliers | Receive Tech Packs and RFQs on Genpire",
  description:
    "Get structured tech packs and RFQs from brands and creators. Quote faster, reduce errors, and streamline production communication with Genpire.",
}

export default function TechpackForSuppliersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
