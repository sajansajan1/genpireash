"use client";

import { useEffect, useState } from "react";
import { FileText, Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetSupplierRfqsStore } from "@/lib/zustand/supplier/rfqs/getSupplierRfqs";
import { ErrorBoundary } from "@/modules/ai-designer";
import SupplierDashboardLoading from "@/app/supplier-dashboard/loading";

export default function SupplierDashboardPage() {
    const router = useRouter();
    const { supplierProfile } = useUserStore();
    const supplierId = supplierProfile?.id;
    const { fetchSupplierRfqs, SupplierRfqs, loadingSupplierRfqs, errorSupplierRfqs } = useGetSupplierRfqsStore();

    useEffect(() => {
        if (!SupplierRfqs) {
            fetchSupplierRfqs(supplierId);
        }
    }, [fetchSupplierRfqs, SupplierRfqs]);

    if (loadingSupplierRfqs || !SupplierRfqs || errorSupplierRfqs) {
        return <SupplierDashboardLoading />;
    }

    const totalOpenRfq = SupplierRfqs.filter((rfq: any) => !rfq.quote?.status);
    const totalRfqRequest = SupplierRfqs.length;

    // if (!supplierProfile?.verified_profile) {
    //   return router.push("/onboarding/manufacturer/success");
    // }
    return (
        <ErrorBoundary>
            <div className="flex flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-col gap-6 items-start justify-between mb-4">
                    <div className="flex-1 space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Supplier Dashboard </h1>
                        <p className="text-[#1C1917]">Manage your manufacturing requests, tech packs, and business profile.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open RFQs</CardTitle>
                            <FileText className="h-4 w-4 text-[#1C1917]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalOpenRfq?.length}</div>
                            <p className="text-xs text-[#1C1917]">since last week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tech Pack Requests</CardTitle>
                            <Sparkles className="h-4 w-4 text-[#1C1917]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRfqRequest}</div>
                            <p className="text-xs text-[#1C1917]">new requests</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-[#1C1917]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-[#1C1917]">unread messages</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="rfqs" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="rfqs">Recent RFQs</TabsTrigger>
                        {/* <TabsTrigger value="techpacks">Tech Pack Requests</TabsTrigger> */}
                        <TabsTrigger value="profile">Company Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rfqs" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent RFQs </CardTitle>
                                <CardDescription>Manage and respond to product quote requests from creators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 w-full">
                                    {SupplierRfqs && SupplierRfqs.length > 0 ? (
                                        SupplierRfqs.slice(0, 3).map((item, index) => (
                                            <div
                                                key={item.rfq.id || index}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition w-full"
                                            >
                                                {/* Left: RFQ Info */}
                                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                                    <p className="font-medium text-sm text-gray-900 break-words">
                                                        {item.techpack?.tech_pack?.productName || "Unnamed Product"}
                                                    </p>

                                                    <p className="text-xs text-gray-600 break-words">
                                                        <span className="font-medium">Created by:</span> {item.creator?.full_name || "Unknown"}
                                                    </p>

                                                    <p className="text-xs text-gray-600 break-words">
                                                        <span className="font-medium">Contact:</span> {item.creator?.email || "No email provided"}
                                                    </p>
                                                </div>

                                                {/* Right: Action Buttons */}
                                                <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex items-center gap-1 w-full sm:w-auto justify-center"
                                                        onClick={() =>
                                                            router.push(`/supplier-dashboard/messages?chatWith=${item.creator?.user_id}`)
                                                        }
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        Message
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        className="bg-black text-white hover:bg-black/90 w-full sm:w-auto justify-center"
                                                        onClick={() => router.push(`/supplier-dashboard/rfqs/${item.rfq.id}`)}
                                                    >
                                                        View RFQ
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-600">No RFQs available</div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" onClick={() => router.push("/supplier-dashboard/rfqs")}>
                                        View All RFQs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* <TabsContent value="techpacks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tech Pack Requests </CardTitle>
                <CardDescription>Manage tech pack requests from creators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SupplierRfqs?.filter((item) => !item.quote?.status) // Only show if status is null/undefined
                    .slice(0, 3)
                    .map((item, index) => (
                      <div
                        key={item?.rfq?.id || index}
                        className="flex items-center justify-between p-4 border rounded"
                      >
                        <div>
                          <p className="font-medium">{item.techpack?.tech_pack?.productName || "Unnamed Product"}</p>
                          <p className="text-sm text-[#1C1917]">Created by: {item?.creator?.full_name || "Unknown"}</p>
                          <p className="text-xs text-[#1C1917]">
                            Contact: {item?.creator?.email || "No email provided"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/supplier-dashboard/messages?chatWith=${item?.creator?.user_id}`)
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" onClick={() => router.push(`/supplier-dashboard/rfqs/${item?.rfq?.id}`)}>
                            View RFQ
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Invite Creators </h3>
                    <Button size="sm" variant="outline" onClick={() => router.push("/supplier-profile")}>
                      Manage Invites
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="mb-2 font-medium">Your Tech Pack Submission Link</p>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-sm flex-1 truncate">
                        genpire.com/submit/{supplierProfile?.company_name}
                      </code>
                      <Button size="sm" variant="secondary">
                        Copy
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-[#1C1917]">
                      Share this link with creators to receive tech packs directly from them
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

                    <TabsContent value="profile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="whitespace-nowrap ">Company Profile </CardTitle>
                                <CardDescription>Manage your public profile information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium">Business Name</h3>
                                        <p className="text-sm text-[#1C1917]">{supplierProfile?.company_name}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Location</h3>
                                        <p className="text-sm text-[#1C1917]">{supplierProfile?.location}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Minimum Order Quantity</h3>
                                        <p className="text-sm text-[#1C1917]"> {supplierProfile?.manufacturing?.moq} units</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Production Capacity</h3>
                                        <p className="text-sm text-[#1C1917]">
                                            {supplierProfile?.manufacturing?.productionCapacity} units/month
                                        </p>
                                    </div>
                                </div>

                                {supplierProfile?.manufacturing?.certifications && (
                                    <div>
                                        <h3 className="font-medium">Certifications</h3>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {supplierProfile?.manufacturing?.certifications.map((certification: string, index: number) => {
                                                return (
                                                    <Badge key={index} variant="outline" className="">
                                                        {certification}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button onClick={() => router.push("/supplier-dashboard/settings")}>Edit Profile</Button>
                                </div>
                            </CardContent>
                            ;
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ErrorBoundary>
    );
}
