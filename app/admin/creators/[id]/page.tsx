import { Suspense } from "react";
import { getAdminSession } from "@/lib/admin-auth";
import { redirect, notFound } from "next/navigation";
import { getCreatorById, getCreatorTechPacks } from "@/lib/supabase/admin";
import { CreatorDetail } from "@/components/admin/creator-detail";
import { CreatorDetailSkeleton } from "@/components/admin/creator-detail-skeleton";

export default async function CreatorDetailPage({ params }: { params: { id: string } }) {
  const session = await getAdminSession();

  // if (!session) {
  //   redirect("/admin/login")
  // }

  const id = params.id;
  const creator = await getCreatorById(id);

  if (!creator) {
    notFound();
  }

  const techPacks = await getCreatorTechPacks(params.id);

  return (
    <div className="space-y-6">
      <Suspense fallback={<CreatorDetailSkeleton />}>
        <CreatorDetail creator={creator} techPacks={techPacks} />
      </Suspense>
    </div>
  );
}
