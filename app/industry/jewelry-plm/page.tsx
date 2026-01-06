import FashionPLMClientPage from "./JewelryPLMClientPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jewelry PLM Software: AI-Powered Tech Pack Generation for Jewelry Designers",
  description:
    "Create jewelry tech packs in minutes, not weeks. Genpire’s AI-powered PLM platform helps designers manage collections, reduce errors, and scale production with ease. Book your demo today.",
  keywords:
    "fashion PLM, apparel PLM, tech pack software, fashion design software, PLM fashion industry, fashion product development, AI clothing generator, fashion tech pack designer, PLM software fashion, fashion designer freelancer",
  openGraph: {
    title: "Jewelry PLM Software: AI-Powered Tech Pack Generation for Jewelry Designers.",
    description:
      "Create jewelry tech packs in minutes, not weeks. Genpire’s AI-powered PLM platform helps designers manage collections, reduce errors, and scale production with ease. Book your demo today.",
    url: "https://www.genpire.com/industry/jewelry-plm/",
    type: "website",
  },
};

export default function FashionPLMPage() {
  return <FashionPLMClientPage />;
}
