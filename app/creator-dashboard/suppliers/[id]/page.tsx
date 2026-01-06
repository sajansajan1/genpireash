"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, MapPin, Globe, Mail, Phone, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { getSingleSupplier } from "@/lib/supabase/supplier";
import { SimpleRFQDialog } from "@/components/rfq/simple-rfq-dialog";
import { createRFQ, supplierRfq } from "@/lib/supabase/rfq";
import { toast } from "@/hooks/use-toast";
import SupplierProfileLoading from "./loading";
import { useUserStore } from "@/lib/zustand/useStore";
import useSWR from "swr";

export default function SupplierProfilePage() {
  const params = useParams();
  const supplierId = params.id as string;
  const [isRFQDialogOpen, setIsRFQDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const router = useRouter();
  const { creatorProfile } = useUserStore();
  const {
    data: supplier,
    error: supplierError,
    isLoading: loadingsupplier,
  } = useSWR("supplier", () => getSingleSupplier(supplierId), {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  if (loadingsupplier || !supplier) {
    return <SupplierProfileLoading />;
  }

  if (supplierError) {
    return <div>Error loading supplier</div>;
  }
  const handleRFQSubmit = async ({
    rfqData,
    supplierIds,
    supplierDetails,
  }: {
    rfqData: any;
    supplierIds: string[];
    supplierDetails: any[];
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
        supplierDetails.map((supplierUser) =>
          Promise.all([
            fetch("/api/send-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "rfq",
                email: supplierUser?.email,
                creatorName: creatorProfile?.full_name,
                supplierName: supplierUser?.company_name,
                productName: rfqData.title,
                rfqLink: "https://www.genpire.com/supplier-dashboard/rfqs",
              }),
            }),
            fetch("/api/send-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "rfq-confirmation",
                email: creatorProfile?.email,
                creatorName: creatorProfile?.full_name,
                supplierName: supplierUser?.company_name,
                productName: rfqData.title,
              }),
            }),
          ]).catch((error) => {
            console.error(`Email failed for supplier user ${supplierUser?.email}:`, error);
            toast({
              title: "Email Failed",
              description: `Email sending failed for ${supplierUser?.company_name}.`,
            });
          })
        )
      );
      await Promise.all(
        supplierDetails.map(async (supplierUserId) => {
          try {
            if (creatorProfile?.user_id) {
              await fetch("/api/send-notification", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  creatorId: creatorProfile.user_id,
                  supplierId: supplierUserId?.user_id ?? "",
                  title: "New RFQ",
                  message: `${creatorProfile?.full_name} has sent you a new RFQ titled "${rfqData.title}".`,
                  type: "rfq_response",
                }),
              });
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

  const handleContactSupplier = (supplierId: string) => {
    router.push(`/creator-dashboard/messages?chatWith=${supplierId}`);
  };
  const openRFQDialog = () => {
    setSelectedSupplier(supplier);
    setIsRFQDialogOpen(true);
  };

  if (!supplier) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
        <p className="mb-6">The supplier you're looking for doesn't exist or has been removed.</p>
        <Button asChild variant="outline">
          <Link href="/creator-dashboard/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back button */}
      <div>
        <Button variant="outline" onClick={() => router.push("/creator-dashboard/suppliers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Suppliers
        </Button>
      </div>

      {/* Supplier header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border bg-muted flex items-center justify-center">
          {supplier?.company_logo ? (
            <Image
              src={supplier?.company_logo}
              alt={`${supplier?.company_name} logo`}
              width={64} // match container size
              height={64} // match container size
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-base sm:text-lg font-semibold text-[#1C1917]">
              {supplier?.company_name?.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{supplier?.full_name}</h1>
            {supplier?.verified_profile && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center mt-2">
            <MapPin className="h-4 w-4 mr-1 text-[#1C1917]" />
            <span className="text-[#1C1917]">{supplier?.location}</span>
            {/* <div className="flex items-center ml-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{supplier.rating}</span>
              <span className="text-sm text-[#1C1917] ml-1">({supplier.reviewCount} reviews)</span>
            </div> */}
          </div>
          <p className="mt-4 text-[#1C1917]">{supplier?.description}</p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button onClick={openRFQDialog} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Request Quote
          </Button>
          <Button variant="outline" onClick={() => handleContactSupplier(supplier?.user_id)}>
            <span>Contact Supplier</span>
          </Button>
        </div>
      </div>

      {/* Supplier details */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-[#1C1917]" />
                  <a
                    href={supplier?.company_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1C1917] hover:underline"
                  >
                    {supplier?.company_url || "Not Available"}
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#1C1917]" />
                  <a href={`mailto:${supplier?.email}`} className="text-[#1C1917] hover:underline">
                    {supplier?.email || "Not Available"}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#1C1917]" />
                  <span>{supplier?.contact || "Not Available"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* <div className="flex justify-between">
                  <span className="text-[#1C1917]">Established:</span>
                  <span>{supplier.yearEstablished}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-[#1C1917]">Employees:</span>
                  <span>{supplier?.employeeCount || 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1C1917]">Production Capacity:</span>
                  <span>{supplier?.manufacturing?.productionCapacity} units/month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manufacturing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#1C1917]">Min. Order:</span>
                  <span>{supplier?.manufacturing?.moq || 0} units</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-[#1C1917]">Min. Order Value:</span>
                  <span>{supplier.minimumOrderValue}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-[#1C1917]">Lead Time:</span>
                  <span>
                    {supplier?.manufacturing?.leadTimeMax}-{supplier?.manufacturing?.leadTimeMin} weeks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1C1917]">Sample Turnaround:</span>
                  <span>{supplier?.manufacturing?.samplePricing}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supplier?.manufacturing?.material_specialist?.map((specialty: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supplier?.manufacturing?.certifications?.map((cert: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4 font-medium" />
                    {cert}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* 
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Gallery</CardTitle>
              <CardDescription>Examples of products manufactured by {supplier.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplier.productImages.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                    <Image
                      src={image || "/bustling-textile-floor.png"}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* <TabsContent value="factory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Factory Gallery</CardTitle>
              <CardDescription>Images of {supplier.name}'s manufacturing facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplier.factoryImages.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Factory image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Payment Terms</h3>
                <p>{supplier.paymentTerms}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Shipping Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.shippingMethods.map((method: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
      {/* RFQ Dialog */}
      <SimpleRFQDialog
        open={isRFQDialogOpen}
        onOpenChange={setIsRFQDialogOpen}
        preselectedSuppliers={supplier ? [supplier] : []}
        onSubmit={handleRFQSubmit}
      />
    </div>
  );
}
