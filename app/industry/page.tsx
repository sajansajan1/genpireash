import { IndustryClientPage } from "./IndustryClientPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries & Categories | AI Tech Pack Generator for Every Product Type",
  description:
    "Discover how Genpire's AI tech pack generator serves 8+ industries including apparel, accessories, home goods, toys, and more. See personas and use cases for each category.",
  keywords:
    "tech pack generator industries, apparel tech pack, accessories tech pack, home goods manufacturing, product categories, fashion tech pack, furniture specifications",
};

export default function IndustryPage() {
  return <IndustryClientPage />;
}
