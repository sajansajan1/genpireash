"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Activity, FileText, Clock, StickyNote } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Supplier {
    address: string
    company_description: string
    company_logo: string
    company_name: string
    company_url: string
    contact: string
    created_at: string
    description: string
    email: string
    full_name: string
    id: string
    location: string
    manufacturingID: string
    role: string
    updated_at: string
    user_id: string
    verified_profile: string
    website: string
}

interface SupplierDetailProps {
    supplier: Supplier;
}

export function SupplierDetail({ supplier }: any) {
    console.log("🔍 ~ SupplierDetail ~ components/admin/supplier-details.tsx:37 ~ supplier:", supplier);
    const router = useRouter();
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{supplier?.company_name || "N/A"}</h1>
                    <p className="text-[#1C1917]">{supplier?.email || "N/A"}</p>
                </div>
            </div>

            {/* Creator Info */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Join Date</CardTitle>
                        <Calendar className="h-4 w-4 text-[#1C1917]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{format(new Date(supplier?.created_at), "MMM dd, yyyy")}</div>
                        <p className="text-xs text-[#1C1917]">
                            {formatDistanceToNow(new Date(supplier?.created_at), { addSuffix: true })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile & Onboarding Details */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile & Onboarding Details</CardTitle>
                            <CardDescription>Information provided during signup and onboarding</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {/* Company Name */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Company Name</h4>
                                    <p className="font-medium">{supplier.company_name || "N/A"}</p>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                                    <p className="font-medium">{supplier.email || "N/A"}</p>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                                    <p className="font-medium">{supplier.contact || "N/A"}</p>
                                </div>

                                {/* Address */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                                    <p className="font-medium">{supplier.address || "N/A"}</p>
                                </div>

                                {/* Location */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                                    <p className="font-medium">
                                        {[supplier.location, supplier.country].filter(Boolean).join(", ") || "N/A"}
                                    </p>
                                </div>

                                {/* Website */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
                                    {supplier.website ? (
                                        <a
                                            href={supplier.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {supplier.website}
                                        </a>
                                    ) : (
                                        <p className="font-medium">N/A</p>
                                    )}
                                </div>

                                {/* Full Name */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                                    <p className="font-medium">{supplier.full_name || "N/A"}</p>
                                </div>

                                {/* Company Description */}
                                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">Company Description</h4>
                                    <p className="font-medium">{supplier.company_description || "N/A"}</p>
                                </div>

                                {/* --- MANUFACTURING SECTION --- */}
                                {/* Product Categories */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Product Categories</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.product_categories?.join(", ") || "N/A"}
                                    </p>
                                </div>

                                {/* Material Specialization */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Material Specialist</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.material_specialist?.join(", ") || "N/A"}
                                    </p>
                                </div>

                                {/* MOQ */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Minimum Order Quantity</h4>
                                    <p className="font-medium">{supplier.manufacturing?.moq || "N/A"}</p>
                                </div>

                                {/* Lead Time */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Lead Time</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.leadTimeMin} - {supplier.manufacturing?.leadTimeMax} days
                                    </p>
                                </div>

                                {/* Sample Pricing */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Sample Pricing</h4>
                                    <p className="font-medium">${supplier.manufacturing?.samplePricing || "N/A"}</p>
                                </div>

                                {/* Production Capacity */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Production Capacity</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.productionCapacity || "N/A"}
                                    </p>
                                </div>

                                {/* Certifications */}
                                <div className="space-y-1 md:col-span-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Certifications</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.certifications?.join(", ") || "N/A"}
                                    </p>
                                </div>

                                {/* Production Capabilities */}
                                <div className="space-y-1 md:col-span-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Production Capabilities</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.product_capability?.join(", ") || "N/A"}
                                    </p>
                                </div>

                                {/* Export Market */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Export Market</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.export_market?.join(", ") || "N/A"}
                                    </p>
                                </div>

                                {/* Factory About */}
                                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">About the Factory</h4>
                                    <p className="font-medium">
                                        {supplier.manufacturing?.aboutFactory || "N/A"}
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
