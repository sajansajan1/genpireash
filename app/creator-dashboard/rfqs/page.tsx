"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  Plus,
  Filter,
  ChevronDown,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { CreateRFQDialog } from "@/components/rfq/create-rfq-dialog";
import { useUser } from "@/components/messages/session";
import { fetchCreatorProfile } from "@/lib/supabase/messages";
import { createRFQ, fetchCreatorRfqs, supplierRfq, updateRfqCreatorStatus } from "@/lib/supabase/rfq";
import { RFQCreator } from "@/lib/types/tech-packs";
import { SimpleRFQDialog } from "@/components/rfq/simple-rfq-dialog";
import RfqLoading from "./loading";
import { sendNotification } from "@/lib/supabase/notifications";
import { useUserStore } from "@/lib/zustand/useStore";
import useSWR, { mutate } from "swr";
import { useGetCreatorRfqsStore } from "@/lib/zustand/supplier/rfqs/getCreatorRfqs";

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

// Supplier response status badge
function ResponseStatusBadge({ status }: { status: "responded" | "awaiting" | "accepted" | "declined" | string }) {
  const statusConfig = {
    responded: {
      label: "Quotes Received",
      icon: CheckCircle,
      className: "text-black border-black",
    },
    awaiting: {
      label: "Awaiting",
      icon: HelpCircle,
      className: "text-black border-black",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.responded;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 ${config.className}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}

export default function CreatorRFQsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedRFQ, setExpandedRFQ] = useState(null);
  const [isRFQDialogOpen, setIsRFQDialogOpen] = useState(false);
  const { creatorProfile } = useUserStore();
  const creatorId = creatorProfile?.id;
  const { errorRfqs, fetchRfqs, rfqs, loadingRfqs, refreshRfqs } = useGetCreatorRfqsStore();

  useEffect(() => {
    if (!creatorId) return;
    if (!rfqs) {
      fetchRfqs(creatorId);
    }

    const interval = setInterval(() => {
      refreshRfqs(creatorId);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchRfqs, creatorId]);

  const handleRFQSubmit = async ({
    rfqData,
    supplierIds,
    supplierDetails,
  }: {
    rfqData: any;
    supplierIds: string[];
    supplierDetails: string[];
  }) => {
    try {
      const rfq = await createRFQ(rfqData);
      if (rfq) {
        const suppliers = await supplierRfq({
          rfqs_id: rfq.id,
          supplier_ids: supplierIds,
        });
      } else {
        throw new Error("RFQ creation failed, rfq is null.");
      }
      await Promise.all(
        supplierDetails.map(async (supplierUserId: any) => {
          try {
            if (creatorProfile?.user_id) {
              await sendNotification(
                creatorProfile?.user_id ?? "",
                supplierUserId?.user_id ?? "",
                "New RFQ",
                `📩 New RFQ from ${creatorProfile?.full_name} for ${rfqData.title}".`,
                "rfq_response"
              );
            }
          } catch (error) {
            console.error(`Notification failed for supplier user ${supplierUserId}:`, error);
            toast({
              title: "RFQ sent, but notification failed",
              description: "The RFQ was sent, but the supplier was not notified.",
            });
          }
        })
      );
      toast({
        title: "RFQ Created",
        description: `Your request for quote has been sent to ${supplierIds.length} supplier(s).`,
      });
    } catch (error) {
      console.error("Error creating RFQ:", error);
      toast({
        title: "Error",
        description: "There was an issue creating the RFQ.",
      });
    }
  };

  const openRFQDialog = () => {
    setIsRFQDialogOpen(true);
  };

  const handleSendDraft = async (
    rfqId: string,
    status: string,
    senderID: string,
    receiverId: string,
    title: string
  ) => {
    if (!creatorId) return;

    const cacheKey = `rfqs-${creatorId}`;
    const previousData = rfqs;
    const updatedRfqs = rfqs?.map((rfq) => (rfq.rfq.id === rfqId ? { ...rfq, rfq: { ...rfq.rfq, status } } : rfq));

    mutate(cacheKey, updatedRfqs, false);

    try {
      const updateDraftStatus = await updateRfqCreatorStatus(rfqId, status);

      if (!updateDraftStatus) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send RFQ.",
        });
      }
      try {
        await sendNotification(
          senderID,
          receiverId,
          "New RFQ",
          `${creatorProfile?.full_name} has sent you a new RFQ titled "${title}".`,
          "rfq_response"
        );
      } catch (notifyError) {
        console.error("Notification failed:", notifyError);
        toast({
          title: "RFQ sent, but notification failed",
          description: "The RFQ was sent, but the supplier was not notified.",
        });
        return;
      }

      toast({
        title: "RFQ sent successfully",
        description: "Your draft RFQ has been sent to the supplier.",
      });
    } catch (error) {
      console.error("Error sending draft RFQ:", error);
      mutate(cacheKey, previousData, false);
      toast({
        title: "Error",
        description: "Failed to send RFQ. Please try again.",
      });
      mutate(cacheKey);
    }
  };

  const toggleExpandRFQ = (rfqId: any) => {
    setExpandedRFQ(expandedRFQ === rfqId ? null : rfqId);
  };

  if (loadingRfqs || !rfqs || errorRfqs) {
    return <RfqLoading />;
  }
  console.log(rfqs, "rfqs");

  const filteredRFQs = rfqs?.filter((rfq) => {
    if (activeTab === "all") return true;
    if (activeTab === "draft") return rfq.rfq.status === "draft";
    if (activeTab === "open") return rfq.rfq.status === "open";
    if (activeTab === "quotes_recieved") return rfq.rfq.status === "quotes_recieved";
    return true;
  });
  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-0 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Request for Quotes</h1>
          <p className="text-sm sm:text-base text-[#1C1917]">
            Manage and track your requests for quotes from suppliers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={openRFQDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create New RFQ
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs Bar */}
          <TabsList className="w-full flex overflow-x-auto whitespace-nowrap no-scrollbar rounded-lg border p-1 gap-1">
            <TabsTrigger
              value="all"
              className="px-3 py-2 text-xs sm:text-sm min-w-fit shrink-0 whitespace-nowrap rounded-md  data-[state=active]:bg-white data-[state=active]:shadow"
            >
              All
            </TabsTrigger>

            <TabsTrigger
              value="draft"
              className="px-3 py-2 text-xs sm:text-sm min-w-fit shrink-0 whitespace-nowrap rounded-md  data-[state=active]:bg-white data-[state=active]:shadow"
            >
              Drafts
            </TabsTrigger>

            <TabsTrigger
              value="open"
              className="px-3 py-2 text-xs sm:text-sm min-w-fit shrink-0 whitespace-nowrap rounded-md data-[state=active]:bg-white data-[state=active]:shadow"
            >
              Open
            </TabsTrigger>

            <TabsTrigger
              value="quotes_recieved"
              className="px-3 py-2 text-xs sm:text-sm min-w-fit shrink-0 whitespace-nowrap rounded-md  data-[state=active]:bg-white data-[state=active]:shadow"
            >
              Quotes Received
            </TabsTrigger>
          </TabsList>

          {/* Filter Button */}
          <Button variant="outline" size="sm" className="w-full sm:w-auto flex items-center justify-center">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {filteredRFQs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Send className="h-5 sm:h-6 w-5 sm:w-6 text-[#1C1917]" />
              </div>
              <h3 className="text-base sm:text-lg font-medium">No RFQs found</h3>
              <p className="text-sm text-[#1C1917] break-words mt-1 mb-4 max-w-md px-4">
                {activeTab === "draft"
                  ? "You don't have any draft RFQs. Create a new RFQ and save it as draft."
                  : activeTab === "open"
                  ? "You don't have any open RFQs. Create a new RFQ to request quotes from suppliers."
                  : activeTab === "responded"
                  ? "You don't have any RFQs with quotes yet. Suppliers will respond to your open RFQs here."
                  : "You don't have any RFQs yet. Create your first RFQ to get started."}
              </p>
              <Button onClick={openRFQDialog}>
                <Send className="mr-2 h-4 w-4" /> Request RFQ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRFQs?.map((rfq) => (
                <Card key={rfq.rfq.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <CardTitle className="text-lg sm:text-xl">{rfq.rfq.title}</CardTitle>
                          <StatusBadge status={rfq.rfq.status} />
                        </div>
                        <CardDescription className="mt-1 text-xs sm:text-sm">
                          Created {new Date(rfq.rfq.created_at).toLocaleDateString()} •
                          {rfq.rfq.status === "draft"
                            ? " Draft"
                            : rfq.suppliers.length <= 1
                            ? " Sent to 1 supplier"
                            : " Sent to multiple suppliers"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {rfq.rfq.status === "draft" ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSendDraft(
                                rfq.rfq.id,
                                "open",
                                creatorProfile?.user_id ?? "",
                                rfq.suppliers[0].profile.user_id,
                                rfq.rfq.title
                              )
                            }
                            className="w-full sm:w-auto"
                          >
                            <Send className="mr-2 h-4 w-4" /> Send RFQ
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpandRFQ(rfq.rfq.id)}
                            className="w-full sm:w-auto"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">Open menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/creator-dashboard/rfqs/${rfq.rfq.id}`)}>
                              View Full Details
                            </DropdownMenuItem>
                            {rfq.rfq.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSendDraft(
                                    rfq.rfq.id,
                                    "open",
                                    rfq.rfq.creator_id,
                                    rfq.suppliers[0].profile.id,
                                    rfq.rfq.title
                                  )
                                }
                              >
                                Send RFQ
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedRFQ === rfq.rfq.id && (
                    <>
                      <Separator />
                      <CardContent className="pt-4 overflow-x-auto">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Product Idea</h4>
                              <p className="text-sm text-[#1C1917] break-words">{rfq.rfq.product_idea}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-1">Tech Pack Details</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs text-[#1C1917]">Materials:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rfq.techpack.tech_pack.materials?.map((material: any, i: any) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {material.material}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-xs text-[#1C1917]">Sizes:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rfq?.techpack.tech_pack.sizeRange.sizes.map((sizes: any, i: any) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {sizes}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-medium text-[#1C1917] mb-1">Quality Standards:</h4>
                                    <p className="text-sm">{rfq?.techpack.tech_pack.qualityStandards}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs text-[#1C1917]">Timeline:</span>
                                    <p className="text-sm">{rfq.rfq.timeline}</p>
                                  </div>

                                  <div>
                                    <span className="text-xs text-[#1C1917]">Quantity:</span>
                                    <p className="text-sm">{rfq.rfq.quantity} units</p>
                                  </div>

                                  {rfq.rfq.target_price && (
                                    <div>
                                      <span className="text-xs text-[#1C1917]">Target Price:</span>
                                      <p className="text-sm">${rfq.rfq.target_price} per unit</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* {rfq.rfq && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Attached Files</h4>
                                <div className="flex flex-wrap gap-2">
                                
                                    <Button key={i} variant="outline" size="sm" className="text-xs">
                                      {file.name}
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )} */}
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Suppliers</h4>
                            {rfq.suppliers.length > 0 ? (
                              <div className="space-y-2 border rounded-md divide-y">
                                {rfq.suppliers.map((supplier: any) => (
                                  <div
                                    key={supplier.profile.id}
                                    className="p-3 bg-card hover:bg-muted/20 transition-colors"
                                  >
                                    <div className="flex flex-wrap justify-between items-start gap-3">
                                      <div className="flex items-center gap-3">
                                        {/* Supplier logo */}
                                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                                          {supplier.profile.company_logo ? (
                                            <Image
                                              src={supplier.profile.company_logo || "/placeholder.svg"}
                                              alt={`${supplier.profile.company_name} logo`}
                                              width={40}
                                              height={40}
                                              className="object-cover"
                                            />
                                          ) : (
                                            <span className="text-lg font-semibold text-[#1C1917]">
                                              {supplier.profile.company_name.charAt(0)}
                                            </span>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium">{supplier.profile.company_name}</p>
                                          <p className="text-xs text-[#1C1917]">{supplier.profile.location}</p>
                                        </div>
                                      </div>
                                      <ResponseStatusBadge
                                        status={supplier?.quote ? supplier.quote.status : "awaiting"}
                                      />
                                    </div>

                                    {(supplier.quote?.status === "responded" ||
                                      supplier.quote?.status === "accepted" ||
                                      supplier.quote?.status === "declined") && (
                                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <div className="bg-muted/30 rounded-md p-2 flex flex-col">
                                          <span className="text-xs text-[#1C1917]">Price</span>
                                          <span className="font-medium">${supplier?.quote?.sample_price || "N/A"}</span>
                                        </div>
                                        <div className="bg-muted/30 rounded-md p-2 flex flex-col">
                                          <span className="text-xs text-[#1C1917]">Lead Time</span>
                                          <span className="font-medium">{supplier?.quote?.lead_time || "N/A"}</span>
                                        </div>
                                        <div className="bg-muted/30 rounded-md p-2 flex flex-col">
                                          <span className="text-xs text-[#1C1917]">MOQ</span>
                                          <span className="font-medium">{supplier?.quote?.moq || "N/A"} units</span>
                                        </div>
                                      </div>
                                    )}

                                    {(supplier.quote?.status === "responded" ||
                                      supplier.quote?.status === "accepted" ||
                                      supplier.quote?.status === "declined") && (
                                      <div className="mt-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full text-xs"
                                          onClick={() =>
                                            router.push(`/creator-dashboard/rfqs/${supplier.quote?.rfq_id}`)
                                          }
                                        >
                                          View Full Quote
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-[100px] border rounded-md">
                                <p className="text-sm text-[#1C1917] break-words">No suppliers selected</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/creator-dashboard/rfqs/${rfq.rfq.id}`)}
                        >
                          View Full Details
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SimpleRFQDialog open={isRFQDialogOpen} onOpenChange={setIsRFQDialogOpen} onSubmit={handleRFQSubmit} />
    </div>
  );
}
