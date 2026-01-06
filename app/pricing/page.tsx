import React, { Suspense } from "react";
import PricingPage from "./pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genpire Pricing | AI Tech Pack Generator Plans",
  description: "Choose a plan to create AI tech packs, product specifications, and factory-ready files. Flexible pricing for creators, brands, and enterprise teams.",
};

export const Pricing = () => {
  return (
    <Suspense>
      <PricingPage />
    </Suspense>
  );
};

export default Pricing;
