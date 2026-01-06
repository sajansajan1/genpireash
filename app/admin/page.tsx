import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[#1C1917]">Overview of your Genpire platform analytics and user insights.</p>
      </div>

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
