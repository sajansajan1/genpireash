import CreatorDashboardLayout from "@/components/creator/dashboard-layout";
import { Suspense } from "react";
import type { ReactNode } from "react";
import CreatorDashboardLoading from "./loading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genpire Creator Dashboard — Your AI Product Creation Studio",
  description: "Manage your products, generate new concepts, and unlock factory-ready outputs instantly. The Genpire Creator Dashboard serves are your  AI Creative Director, privdes proactive ideas, and a full end-to-end product creation workflow — all in one place.",
};

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<CreatorDashboardLoading />}>
      <CreatorDashboardLayout>{children}</CreatorDashboardLayout>
    </Suspense>
  );
}
