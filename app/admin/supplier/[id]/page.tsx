import { Suspense } from "react";
import { getAdminSession } from "@/lib/admin-auth";
import { redirect, notFound } from "next/navigation";
import { getSupplierById } from "@/lib/supabase/admin";
import { SupplierDetail } from "@/components/admin/supplier-details";
import { CreatorDetailSkeleton } from "@/components/admin/creator-detail-skeleton";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {

    const id = params.id;
    const supplier = await getSupplierById(id);

    if (!supplier) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Suspense fallback={<CreatorDetailSkeleton />}>
                <SupplierDetail supplier={supplier} />
            </Suspense>
        </div>
    );
}
