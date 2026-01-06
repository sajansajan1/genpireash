"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, Clock, Eye, FileText, Loader2, Mail, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/messages/session";
import { fetchSupplierProfile } from "@/lib/supabase/messages";
import { fetchSupplierRfqs, updateRfqStatus } from "@/lib/supabase/rfq";
import { RFQ } from "@/lib/types/tech-packs";
import { useRouter } from "next/navigation";
import RfqLoading from "@/app/creator-dashboard/rfqs/loading";
// import { supplierProfile } from "@/lib/utils/localstorage";
import useSWR, { mutate } from "swr";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetSupplierRfqsStore } from "@/lib/zustand/supplier/rfqs/getSupplierRfqs";
import { ErrorBoundary } from "@/modules/ai-designer";

// Define types
type RFQStatus = "awaiting" | "responded" | "archived" | "accepted" | "declined";

export default function RFQsPage() {
  const router = useRouter();
  const { supplierProfile } = useUserStore();
  const supplierId = supplierProfile?.id;
  const { fetchSupplierRfqs, SupplierRfqs, loadingSupplierRfqs, errorSupplierRfqs, refreshSupplierRfqs } =
    useGetSupplierRfqsStore();
  console.log("SupplierRfqs ==> ", SupplierRfqs);

  useEffect(() => {
    if (!supplierId) return;
    if (!SupplierRfqs) {
      fetchSupplierRfqs(supplierId);
    }

    const interval = setInterval(() => {
      refreshSupplierRfqs(supplierId);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchSupplierRfqs, supplierId]);

  // Handle loading states
  if (loadingSupplierRfqs || !SupplierRfqs || errorSupplierRfqs) {
    return <RfqLoading />;
  }

  const handleupdateRfqStatus = async (id: string, status: string) => {
    if (!supplierId) return;
    const updatedRfqs = SupplierRfqs?.map((rfq: any) =>
      rfq.rfq.id === id ? { ...rfq, quote: { ...rfq.quote, status } } : rfq
    );
    mutate(`rfqs-${supplierId}`, updatedRfqs, false);
    try {
      const res = await updateRfqStatus(id, supplierId, status);
      if (!res) {
        throw new Error("Failed to update RFQ status");
      }
      mutate(`rfqs-${supplierId}`);
    } catch (error) {
      console.error("Error updating RFQ status:", error);
      mutate(`rfqs-${supplierId}`, SupplierRfqs, false);
    }
  };

  const getStatusBadge = (status: RFQStatus | null | undefined) => {
    if (!status) {
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          Awaiting Quote
        </Badge>
      );
    }

    switch (status) {
      case "responded":
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            Responded
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            Declined
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            Awaiting Quote
          </Badge>
        );
    }
  };

  const handleContactCreator = (creatorID: string) => {
    router.push(`/supplier-dashboard/messages?chatWith=${creatorID}`);
  };
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFQ Inbox </h1>
          <p className="text-[#1C1917]">Manage and respond to product quote requests from creators</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All RFQs</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="responded">Responded</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {SupplierRfqs?.filter((rfq) => rfq?.rfq?.status !== "draft").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No RFQs response.</p>
            </div>
          ) : (
            SupplierRfqs?.filter((rfq) => rfq?.rfq?.status !== "draft").map((rfq) => (
              <RFQCard
                key={rfq.rfq.id}
                rfq={rfq}
                updateStatus={handleupdateRfqStatus}
                getStatusBadge={getStatusBadge}
                getTimeAgo={getTimeAgo}
                handleContactCreator={handleContactCreator}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="awaiting" className="space-y-4 mt-6">
          {SupplierRfqs?.filter((rfq) => !rfq?.quote?.status || rfq?.rfq?.status !== "draft").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No RFQs awaiting response.</p>
            </div>
          ) : (
            SupplierRfqs?.filter((rfq) => !rfq?.quote?.status && rfq?.rfq?.status !== "draft").map((rfq) => (
              <RFQCard
                key={rfq?.rfq?.id}
                rfq={rfq}
                updateStatus={handleupdateRfqStatus}
                getStatusBadge={getStatusBadge}
                getTimeAgo={getTimeAgo}
                handleContactCreator={handleContactCreator}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="accepted" className="space-y-4 mt-6">
          {SupplierRfqs?.filter((rfq) => !rfq?.quote?.status || rfq?.rfq?.status !== "draft").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No RFQs accepted response.</p>
            </div>
          ) : (
            SupplierRfqs?.filter((rfq) => rfq?.quote?.status === "accepted" && rfq?.rfq?.status !== "draft").map(
              (rfq) => (
                <RFQCard
                  key={rfq?.rfq?.id}
                  rfq={rfq}
                  updateStatus={handleupdateRfqStatus}
                  getStatusBadge={getStatusBadge}
                  getTimeAgo={getTimeAgo}
                  handleContactCreator={handleContactCreator}
                />
              )
            )
          )}
        </TabsContent>
        <TabsContent value="declined" className="space-y-4 mt-6">
          {SupplierRfqs?.filter((rfq) => !rfq?.quote?.status || rfq?.rfq?.status !== "draft").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No RFQs declined response.</p>
            </div>
          ) : (
            SupplierRfqs?.filter((rfq) => rfq?.quote?.status === "declined" && rfq?.rfq?.status !== "draft").map(
              (rfq) => (
                <RFQCard
                  key={rfq?.rfq?.id}
                  rfq={rfq}
                  updateStatus={handleupdateRfqStatus}
                  getStatusBadge={getStatusBadge}
                  getTimeAgo={getTimeAgo}
                  handleContactCreator={handleContactCreator}
                />
              )
            )
          )}
        </TabsContent>

        <TabsContent value="responded" className="space-y-4 mt-6">
          {SupplierRfqs?.filter((rfq) => !rfq?.quote?.status || rfq?.rfq?.status !== "draft").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No RFQs responded response.</p>
            </div>
          ) : (
            SupplierRfqs?.filter((rfq) => rfq?.quote?.status === "responded" && rfq?.rfq?.status !== "draft").map(
              (rfq) => (
                <RFQCard
                  key={rfq.rfq.id}
                  rfq={rfq}
                  updateStatus={handleupdateRfqStatus}
                  getStatusBadge={getStatusBadge}
                  getTimeAgo={getTimeAgo}
                  handleContactCreator={handleContactCreator}
                />
              )
            )
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          {SupplierRfqs?.filter((rfq) => !rfq?.quote?.status || rfq?.rfq?.status !== "draft").length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No RFQs archievd.</p>
            </div>
          ) : (
            SupplierRfqs?.filter((rfq) => rfq?.quote?.status === "archived" && rfq?.rfq?.status !== "draft").map(
              (rfq) => (
                <RFQCard
                  key={rfq.rfq.id}
                  rfq={rfq}
                  updateStatus={handleupdateRfqStatus}
                  getStatusBadge={getStatusBadge}
                  getTimeAgo={getTimeAgo}
                  handleContactCreator={handleContactCreator}
                />
              )
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RFQCardProps {
  rfq: RFQ;
  updateStatus: (id: string, status: string) => void;
  getStatusBadge: (status: RFQStatus) => React.ReactNode;
  getTimeAgo: (dateString: string) => string;
  handleContactCreator: (creatorID: string) => void;
}

function RFQCard({ rfq, updateStatus, getStatusBadge, getTimeAgo, handleContactCreator }: RFQCardProps) {
  return (
    <ErrorBoundary>
      <Card className="mx-auto">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex-1">
              <CardTitle>{rfq?.rfq?.title}</CardTitle>
              <CardDescription>From: {rfq?.creator?.full_name ?? "Anonymous Creator"}</CardDescription>
            </div>
            <div className="mt-2 sm:mt-0">{getStatusBadge(rfq.quote?.status as RFQStatus)}</div>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-[#1C1917] dark:text-zinc-300">
            <Clock className="mr-1 h-4 w-4" />
            <span>Received {getTimeAgo(rfq?.rfq?.created_at)}</span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm">{rfq?.rfq?.product_idea}</p>

          <div className="mt-2 flex flex-wrap gap-1">
            {rfq?.techpack?.tech_pack?.materials?.slice(0, 2).map((material: any, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {material.material}
              </Badge>
            ))}
            {rfq?.techpack?.tech_pack?.materials?.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{rfq?.techpack?.tech_pack?.materials?.length - 2} more
              </Badge>
            )}
          </div>

          {rfq?.quote?.status === "responded" && (
            <div className="mt-3 p-2 dark:bg-green-900/20 rounded-md border dark:border-green-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-green-300">Your Quote:</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="text-xs text-[#1C1917]">Sample Price</p>
                  <p className="text-sm font-medium">${parseFloat(rfq?.quote?.sample_price).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#1C1917]">Lead Time</p>
                  <p className="text-sm font-medium">{rfq?.quote?.lead_time}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
          <div className="flex items-center text-sm">
            <FileText className="mr-1 h-4 w-4" />
            <span>1 file</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {(!rfq?.quote?.status || rfq?.quote?.status === "awaiting") && (
              <Button variant="outline" size="sm" onClick={() => updateStatus(rfq?.rfq?.id, "archived")}>
                <Archive className="mr-1 h-4 w-4" /> Archive
              </Button>
            )}
            {rfq?.quote?.status === "archived" && (
              <Button variant="outline" size="sm" onClick={() => updateStatus(rfq?.rfq?.id, "awaiting")}>
                <Mail className="mr-1 h-4 w-4" /> Reopen
              </Button>
            )}
            {rfq?.creator?.id && (
              <Button variant="outline" size="sm" onClick={() => handleContactCreator(rfq?.creator?.user_id)}>
                <MessageCircle className="mr-1 h-4 w-4" /> Send Message
              </Button>
            )}
            <Button asChild size="sm">
              <Link href={`/supplier-dashboard/rfqs/${rfq?.rfq?.id}`}>
                <Eye className="mr-1 h-4 w-4" /> View RFQ
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
}
