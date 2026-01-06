import AccessoriesPLMClientPage from "./AccessoriesPLMClientPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BagPLM | Wallets Tech Pack| AI-Powered Accessories Tech Packs in Minutes",
  description:
    "AI-powered accessories PLM platform for instant bag, wallet, and jewelry tech packs. Create detailed accessories tech packs in minutes with Genpire",
  keywords: "BagPLM | Wallets Tech Pack| AI-Powered Accessories Tech Packs in Minutes",
  openGraph: {
    title: "BagPLM | Wallets Tech Pack| AI-Powered Accessories Tech Packs in Minutes",
    description:
      "AI-powered accessories PLM platform for instant bag, wallet, and jewelry tech packs. Create detailed accessories tech packs in minutes with Genpire.",
    url: "https://www.genpire.com/industry/accessories-plm/",
    type: "website",
  },
};

export default function FashionPLMPage() {
  return <AccessoriesPLMClientPage />;
}
