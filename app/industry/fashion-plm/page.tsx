import FashionPLMClientPage from "./FashionPLMClientPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fashion PLM Revolution: Design Faster, Launch Smarter | Genpire",
  description:
    "Revolutionary fashion PLM technology meets creative brilliance. Transform your fashion business with intelligent Product Lifecycle Management. AI-powered fashion tech pack development, apparel PLM management, and fashion designer freelancer network.",
  keywords:
    "fashion PLM, apparel PLM, tech pack software, fashion design software, PLM fashion industry, fashion product development, AI clothing generator, fashion tech pack designer, PLM software fashion, fashion designer freelancer",
  openGraph: {
    title: "Fashion PLM Revolution: Design Faster, Launch Smarter | Genpire",
    description:
      "Revolutionary fashion PLM technology meets creative brilliance. Transform your fashion business with intelligent Product Lifecycle Management.",
    url: "https://www.genpire.com/industry/fashion-plm/",
    type: "website",
  },
}

export default function FashionPLMPage() {
  return <FashionPLMClientPage />
}
