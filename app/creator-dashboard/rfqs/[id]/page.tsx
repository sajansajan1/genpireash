"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Download,
  Archive,
  X,
  Check,
  Clock,
  Package,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AcceptRFQ, getSingleCreatorRfq } from "@/lib/supabase/rfq";
import { sendNotification } from "@/lib/supabase/notifications";
import { generatePdffromTechpack } from "@/components/pdf-generator";
import useSWR, { mutate } from "swr";
import { useUserStore } from "@/lib/zustand/useStore";

// Status badge component
function StatusBadge({ status }: { status: "Open" | "quotes_recieved" | "draft" | string }) {
  type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | null | undefined;
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    open: { label: "Open", variant: "outline" },
    quotes_recieved: { label: "Quotes Received", variant: "secondary" },
    draft: { label: "Draft", variant: "default" },
  };

  const config = statusConfig[status] ?? { label: status, variant: "outline" };

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}

export default function RFQDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params); // Unwrap the params
  const id = params.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const { creatorProfile } = useUserStore();
  const creatorId = creatorProfile?.id;

  const {
    data: rfq,
    error: rfqsError,
    isLoading: loadingrfqs,
  } = useSWR(
    creatorId ? `rfq-${creatorId}` : null,
    async () => {
      if (!creatorId) return null;
      return await getSingleCreatorRfq(id, creatorId);
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );
  if (loadingrfqs) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1C1917]" />
      </div>
    );
  }

  if (rfqsError) {
    return <div>Error loading RFQs</div>;
  }
  console.log(rfq, "rfq");
  const handleContactSupplier = (supplierId: string) => {
    router.push(`/creator-dashboard/messages?chatWith=${supplierId}`);
  };

  const handleAcceptQuote = async (supplierId: string, rfqId: string, status: string, receiverId: string) => {
    if (!creatorId) return;
    const cacheKey = `rfq-${creatorId}`;
    const previousData = rfq;
    const updatedSuppliers = rfq?.suppliers?.map((supplier: any) =>
      supplier.profile.id === supplierId
        ? {
            ...supplier,
            status,
            quote: {
              ...supplier.quote,
              status,
            },
          }
        : supplier
    );
    mutate(cacheKey, { ...rfq, suppliers: updatedSuppliers }, false);
    try {
      const quoteAccept = await AcceptRFQ({
        rfq_id: rfqId,
        supplier_id: supplierId,
        status,
      });

      if (!quoteAccept) {
        throw new Error("Failed to accept quote. No data returned.");
      }
      try {
        if (creatorProfile?.user_id) {
          await sendNotification(
            creatorProfile.user_id,
            receiverId,
            "RFQ Status Updated",
            `Your RFQ "${rfq?.rfq?.title}" has been ${status}.`,
            "rfq_update"
          );
        }
      } catch (notificationError) {
        console.error("Notification failed:", notificationError);
        toast({
          title: "RFQ updated, but notification failed",
          description: "The RFQ was updated, but the supplier could not be notified.",
        });
        return;
      }
      toast({
        title: `Quote ${status}`,
        description: `You've ${status} the quote. The supplier has been notified.`,
      });
      mutate(cacheKey);
    } catch (error) {
      console.error("Error accepting quote:", error);
      mutate(cacheKey, previousData, false);
      toast({
        title: "Error",
        description: "There was a problem accepting the quote. Please try again.",
      });
      mutate(cacheKey);
    }
  };

  if (!rfq) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">RFQ not found</h3>
          <p className="text-[#1C1917] mt-1 mb-4">The requested RFQ could not be found.</p>
          <Button onClick={() => router.push("/creator-dashboard/rfqs")}>View All RFQs</Button>
        </div>
      </div>
    );
  }

  // console.log("hasQuotes ==> ", rfq.suppliers.quote);
  const hasQuotes = rfq?.suppliers?.some((s: any) => s.quote?.status === "responded");
  console.log("hasQuotes ==> ", hasQuotes);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className=" h-4 w-4" /> Back
        </Button>
        <StatusBadge status={rfq?.rfq?.status} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{rfq?.rfq.title}</h1>
          <p className="text-[#1C1917]">
            Created {new Date(rfq?.rfq?.created_at).toLocaleDateString()} •
            {rfq?.suppliers?.length <= 1 ? " Sent to 1 supplier" : " Sent to multiple suppliers"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responded" disabled={!hasQuotes}>
            Quotes {hasQuotes && `(${rfq?.suppliers?.filter((s: any) => s.quote?.status === "responded").length})`}
          </TabsTrigger>
          <TabsTrigger value="techpack">Tech Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Product Idea</h4>
                  <p className="text-sm text-[#1C1917]">{rfq?.rfq?.product_idea}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Timeline & Quantity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#1C1917]">Timeline</p>
                      <p className="text-sm font-medium">{rfq?.rfq?.timeline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#1C1917]">Quantity</p>
                      <p className="text-sm font-medium">{rfq?.rfq?.quantity} units</p>
                    </div>
                    {rfq?.rfq.target_price && (
                      <div>
                        <p className="text-xs text-[#1C1917]">Target Price</p>
                        <p className="text-sm font-medium">${rfq?.rfq?.target_price} per unit</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Tech Pack Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-[#1C1917] mb-1">Materials</p>
                    <div className="flex flex-wrap gap-1">
                      {rfq?.techpack?.tech_pack?.materials?.map((material: any, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {material?.material}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#1C1917] mb-1">Sizes</p>
                    <div className="flex flex-wrap gap-1">
                      {rfq?.techpack?.tech_pack?.sizeRange?.sizes?.map((sizes: any, i: any) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {sizes}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {rfq?.techpack?.tech_pack?.qualityStandards && (
                    <div>
                      <h4 className="text-sm font-medium text-[#1C1917] mb-1">Quality Standards</h4>
                      <p className="text-sm">{rfq?.techpack?.tech_pack?.qualityStandards}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
              <>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium mb-2">Attached Files</h4>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-2"
                      onClick={() => generatePdffromTechpack({ tech_pack: rfq?.techpack })}
                    >
                      Download pdf
                      <ExternalLink className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Responses</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {rfq?.suppliers?.length} supplier{rfq?.suppliers?.length !== 1 ? "s" : ""} received this RFQ
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {rfq?.suppliers.map((supplier: any) => {
                  const isQuoted = supplier?.quote?.status === "responded";
                  const isDeclined = supplier?.quote?.status === "declined";
                  const isPending = !supplier?.quote?.status;
                  const isAccepted = supplier?.quote?.status === "accepted";

                  return (
                    <div
                      key={supplier?.profile?.id}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={supplier?.profile?.company_logo} alt={supplier.name} />
                            <AvatarFallback>{supplier?.profile?.company_name?.charAt(0)}</AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="font-medium text-sm sm:text-base">{supplier?.profile?.company_name}</p>

                            <p className="text-[10px] sm:text-xs text-[#1C1917]">{supplier?.profile?.location}</p>

                            {supplier?.quote && (
                              <p className="text-[11px] sm:text-xs text-black font-medium mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                Lead time: {supplier?.quote?.lead_time}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Badge */}
                        <Badge
                          variant={
                            isAccepted
                              ? "secondary"
                              : isQuoted
                              ? "secondary"
                              : isDeclined
                              ? "destructive"
                              : isPending
                              ? "outline"
                              : "default"
                          }
                          className="capitalize text-[10px] sm:text-xs px-2 py-0.5"
                        >
                          {isAccepted
                            ? "Accepted"
                            : isQuoted
                            ? "Quote Received"
                            : isDeclined
                            ? "Declined"
                            : isPending
                            ? "Pending"
                            : "Awaiting"}
                        </Badge>
                      </div>

                      {/* QUOTED UI */}
                      {isQuoted && supplier?.quote && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-[10px] sm:text-xs text-[#1C1917] flex items-center gap-1">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                Sample Price
                              </p>
                              <p className="font-medium text-sm sm:text-base">${supplier?.quote?.sample_price}</p>
                            </div>

                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-[10px] sm:text-xs text-[#1C1917] flex items-center gap-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                Lead Time
                              </p>
                              <p className="font-medium text-sm sm:text-base">{supplier?.quote?.lead_time}</p>
                            </div>

                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-[10px] sm:text-xs text-[#1C1917] flex items-center gap-1">
                                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                                MOQ
                              </p>
                              <p className="font-medium text-sm sm:text-base">{supplier?.quote?.moq} units</p>
                            </div>
                          </div>

                          {/* Supplier Message */}
                          <div>
                            <p className="text-[11px] sm:text-xs text-[#1C1917] mb-1 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                              Supplier Response
                            </p>
                            <p className="text-xs sm:text-sm">{supplier?.quote?.message}</p>
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button
                              className="w-full sm:w-auto text-sm sm:text-base"
                              variant="outline"
                              onClick={() =>
                                handleAcceptQuote(
                                  supplier?.profile?.id,
                                  rfq?.rfq?.id,
                                  "declined",
                                  supplier?.profile?.user_id
                                )
                              }
                              disabled={
                                supplier?.quote?.status === "declined" || supplier?.quote?.status === "accepted"
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              {supplier?.quote?.status === "declined" || supplier?.quote?.status == "accepted"
                                ? "Declined"
                                : "Decline Quote"}
                            </Button>

                            <Button
                              className="w-full sm:w-auto text-sm sm:text-base"
                              variant="default"
                              onClick={() =>
                                handleAcceptQuote(
                                  supplier?.profile?.id,
                                  rfq?.rfq?.id,
                                  "accepted",
                                  supplier?.profile?.user_id
                                )
                              }
                              disabled={supplier?.quote?.status === "accepted"}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              {supplier?.quote?.status === "accepted" ? "Accepted" : "Accept Quote"}
                            </Button>

                            <Button
                              className="w-full sm:w-auto text-sm sm:text-base"
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactSupplier(supplier?.profile?.user_id)}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Message Supplier
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* DECLINED */}
                      {isDeclined && supplier?.declineReason && (
                        <div>
                          <p className="text-[10px] sm:text-xs text-[#1C1917] mb-1">Reason</p>
                          <p className="text-xs sm:text-sm">{supplier?.declineReason}</p>
                        </div>
                      )}

                      {/* PENDING */}
                      {isPending && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm text-[#1C1917]">Waiting for response</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactSupplier(supplier?.profile?.user_id)}
                          >
                            <MessageSquare className="mr-1 h-4 w-4" />
                            Contact
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responded" className="mt-6">
          <div className="space-y-6">
            {rfq?.suppliers
              .filter((s: any) => s?.quote?.status === "responded")
              .map((supplier: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={supplier?.profile?.company_logo} alt={supplier.name} />
                          <AvatarFallback>{supplier?.profile?.company_name?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div>
                          {/* Company Name */}
                          <CardTitle className="text-base sm:text-lg">{supplier?.profile?.company_name}</CardTitle>

                          {/* Company Location */}
                          <CardDescription className="text-xs sm:text-sm">{supplier?.location}</CardDescription>
                        </div>
                      </div>

                      {/* Badge */}
                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5">
                        Quote Received
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Grid section */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-[10px] sm:text-xs text-[#1C1917]">Sample Price</p>
                        <p className="font-medium text-sm sm:text-base">${supplier?.quote?.sample_price}</p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-[10px] sm:text-xs text-[#1C1917]">Lead Time</p>
                        <p className="font-medium text-sm sm:text-base">{supplier?.quote?.lead_time}</p>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-[10px] sm:text-xs text-[#1C1917]">MOQ</p>
                        <p className="font-medium text-sm sm:text-base">{supplier?.quote?.moq} units</p>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Message</p>
                      <p className="text-xs sm:text-sm text-[#1C1917]">{supplier?.quote?.message}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="w-full sm:w-auto"
                      variant="outline"
                      onClick={() =>
                        handleAcceptQuote(supplier?.profile?.id, rfq?.rfq?.id, "declined", supplier?.profile?.user_id)
                      }
                      disabled={supplier?.quote?.status === "declined" || supplier?.quote?.status === "accepted"}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {supplier?.quote?.status === "declined" || supplier?.quote?.status == "accepted"
                        ? "Declined"
                        : "Decline Quote"}
                    </Button>

                    <Button
                      className="w-full sm:w-auto"
                      variant="default"
                      onClick={() =>
                        handleAcceptQuote(supplier?.profile?.id, rfq?.rfq?.id, "accepted", supplier?.profile?.user_id)
                      }
                      disabled={supplier?.quote?.status === "accepted"}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {supplier?.quote?.status === "accepted" ? "Accepted" : "Accept Quote"}
                    </Button>

                    <Button
                      className="w-full sm:w-auto"
                      variant="outline"
                      onClick={() => handleContactSupplier(supplier?.id)}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Contact
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="techpack" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tech Pack</CardTitle>
              <CardDescription>Technical specifications for {rfq?.rfq?.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rfq?.techpack?.image_data?.front.url ? (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={rfq?.techpack?.image_data?.front?.url}
                    alt="Tech Pack Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-[#1C1917]">Tech Pack Preview</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Materials</h4>
                  <div className="flex flex-wrap gap-1">
                    {rfq?.techpack?.tech_pack?.materials?.map((material: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {material.material}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Sizes</h4>
                  <div className="flex flex-wrap gap-1">
                    {rfq?.techpack?.tech_pack?.sizeRange?.sizes?.map((sizes: any, i: any) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {sizes}
                      </Badge>
                    ))}
                  </div>
                </div>

                {rfq?.techpack?.tech_pack?.qualityStandards && (
                  <div>
                    <h4 className="text-sm font-medium text-[#1C1917] mb-1">Quality Standards</h4>
                    <p className="text-sm">{rfq?.techpack?.tech_pack?.qualityStandards}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => generatePdffromTechpack({ tech_pack: rfq?.techpack })}>
                <Download className="mr-2 h-4 w-4" />
                Download Tech Pack
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
