import { Suspense } from "react";
import type { ReactNode } from "react";
import { Metadata } from "next";
import SupplierDashboardLayout from "@/components/supplier/dashboard-layout";
import SupplierDashboardLoading from "./loading";

export const metadata: Metadata = {
  title: "Genpire Suppliers Network — Connect With Creators, Brands and Enterprises on Genpire",
  description: "Join Genpire’s verified supplier network to receive high-quality RFQs, review product tech packs, and chat directly with creators through WhatsApp or WeChat. Grow your manufacturing business with AI-matched projects and seamless communication tools.",
};

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SupplierDashboardLoading />}>
      <SupplierDashboardLayout>{children}</SupplierDashboardLayout>
    </Suspense>
  );
}
