"use client";

import type React from "react";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, Download, Loader2, Package, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getSingleSupplierRfq, submitRFQ } from "@/lib/supabase/rfq";
import { sendNotification } from "@/lib/supabase/notifications";
import { toast } from "@/hooks/use-toast";
import { generatePdffromTechpack } from "@/components/pdf-generator";
import useSWR, { mutate } from "swr";
import { supplierProfile } from "@/lib/utils/localstorage";
import { useUserStore } from "@/lib/zustand/useStore";
export default function RFQDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    samplePrice: "",
    leadTime: "",
    moq: "",
    message: "",
  });

  const { supplierProfile } = useUserStore();
  const supplierId = supplierProfile?.id;
  const {
    data: rfq,
    error: rfqError,
    isLoading: loadingRfq,
  } = useSWR(
    id && supplierId ? `rfq-${id}` : null,
    () => {
      if (!supplierId) {
        return Promise.reject("Supplier ID is undefined");
      }
      return getSingleSupplierRfq(id, supplierId);
    },
    {
      revalidateOnFocus: true,
    }
  );

  // Handle loading state
  if (loadingRfq) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1C1917]" />
      </div>
    );
  }

  if (rfqError) {
    return <div>Error loading RFQ data.</div>;
  }

  console.log(rfq, "sfd");
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuoteForm((prev) => ({
      ...prev,
      [name]: name === "samplePrice" || name === "moq" ? Number.parseFloat(value) || 0 : value,
    }));
  };
  // Handle submitting the quote
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!supplierProfile?.id) {
      throw new Error("Supplier ID is missing.");
    }
    try {
      const quoteSubmit = await submitRFQ({
        rfq_id: rfq?.rfq.id,
        supplier_id: supplierProfile?.id,
        sample_price: quoteForm.samplePrice,
        lead_time: quoteForm.leadTime,
        moq: quoteForm.moq,
        message: quoteForm.message,
        status: "responded",
      });

      if (!quoteSubmit) {
        throw new Error("Failed to submit quote");
      }
      if (!supplierProfile?.user_id || !rfq?.creator?.user_id) {
        toast({
          title: "Missing Info",
          description: "Could not find sender or recipient user ID.",
        });
        return;
      }
      await sendNotification(
        supplierProfile.user_id,
        rfq.creator.user_id,
        "New RFQ Response",
        `${supplierProfile?.company_name} has responded to your RFQ for ${rfq?.rfq.title}.`,
        "rfq_response"
      );

      setIsSubmitting(false);
      setSuccessMessage("Quote sent successfully! The creator has been notified of your response.");
      mutate(`rfq-${id}`);
      router.push("/supplier-dashboard/rfqs");
    } catch (error) {
      console.error("Error in handleSubmitQuote:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "There was an issue submitting your quote or sending the notification.",
      });
    }
  };
  const handleLeadTimeChange = (value: string) => {
    setQuoteForm((prev) => ({
      ...prev,
      leadTime: value,
    }));
  };
  const quoteStatus = rfq?.submittedQuotes?.status ?? "awaiting";
  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/supplier-dashboard/rfqs")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to RFQs
        </Button>

        {/* {!rfq?.creator.full_name && (
          <Button variant="outline" size="sm"> 
            <Link href={`/supplier-dashboard/messages?creator=${rfq.creator.id}`}>
              <MessageCircle className="mr-1 h-4 w-4" />
              Message Creator
            </Link> 
          </Button>
        )} */}
      </div>

      {/* RFQ Overview Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-2xl">{rfq?.rfq.title}</CardTitle>
                <CardDescription>
                  From: {rfq?.creator.full_name ? rfq.creator.full_name : "Anonymous Creator"}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                !rfq?.submittedQuotes?.status || rfq.submittedQuotes.status === "awaiting"
                  ? ""
                  : rfq?.submittedQuotes.status === "responded"
                  ? ""
                  : rfq?.submittedQuotes.status === "accepted"
                  ? ""
                  : rfq?.submittedQuotes.status === "declined"
                  ? ""
                  : "bg-gray-100 text-gray-800"
              }
            >
              {!rfq?.submittedQuotes?.status || rfq.submittedQuotes.status === "awaiting"
                ? " Awaiting"
                : rfq?.submittedQuotes.status === "responded"
                ? " Responded"
                : rfq?.submittedQuotes.status === "accepted"
                ? " Accepted"
                : rfq?.submittedQuotes.status === "declined"
                ? " Declined"
                : " Archived"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Product Idea</h3>
            <p>{rfq?.rfq.product_idea}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Tech Pack Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] mb-1">Materials</h4>
                <div className="flex flex-wrap gap-1">
                  {rfq?.techpack?.tech_pack?.materials?.map((material: any, i: any) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {material.material}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#1C1917] mb-1">Quality Standards</h4>
                <p className="text-sm">{rfq?.techpack.tech_pack.qualityStandards}</p>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-[#1C1917] mb-1">Sizes</h4>
                <div className="flex flex-wrap gap-1">
                  {rfq?.techpack.tech_pack.sizeRange.sizes.map((sizes: any, i: any) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {sizes}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* <div>
            <h3 className="font-medium mb-2">Attached Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {rfq.attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center p-2 border rounded-md">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-[#1C1917] uppercase">{file.type}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div> */}

          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => rfq && generatePdffromTechpack({ tech_pack: rfq?.techpack })}
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-[#1C1917]" />
            <div>
              <p className="text-sm font-medium">Timeline</p>
              <p className="text-sm text-[#1C1917]">{rfq?.rfq.timeline}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-[#1C1917]" />
            <div>
              <p className="text-sm font-medium">Sample Quantity</p>
              <p className="text-sm text-[#1C1917]">{rfq?.rfq.quantity} units</p>
            </div>
          </div>

          {rfq?.rfq.target_price && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-[#1C1917]" />
              <div>
                <p className="text-sm font-medium">Target Budget</p>
                <p className="text-sm text-[#1C1917]">${rfq.rfq.target_price} per unit</p>
              </div>
            </div>
          )}

          {/* Add estimated price section */}
          <div className="pt-2 mt-2 border-t">
            <div className="flex items-center">
              <div className="w-full">
                <p className="text-sm font-medium">AI Estimated Sample Cost </p>
                <p className="text-sm text-[#1C1917]">
                  ${(rfq?.techpack.price ? rfq.techpack.price * 1.2 : 25).toFixed(2)} per unit
                </p>
                <p className="text-xs text-[#1C1917] mt-1">
                  *This is an AI-generated estimation and may differ from your actual quote
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Quote Section - Now centrally located */}
      <div className="max-w-3xl mx-auto">
        {["responded", "accepted", "declined"].includes(quoteStatus) ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                {/* <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> */}
                Your Quote
              </CardTitle>
              <CardDescription>
                Sent on {new Date(rfq?.submittedQuotes.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Sample Price</p>
                  <p className="text-sm">${rfq?.submittedQuotes.sample_price}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Lead Time</p>
                  <p className="text-sm">{rfq?.submittedQuotes.lead_time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">MOQ</p>
                  <p className="text-sm">{rfq?.submittedQuotes.moq} units</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Your Message</p>
                <p className="text-sm text-[#1C1917]">{rfq?.submittedQuotes.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Quote </CardTitle>
              <CardDescription>Provide details about your offer to the creator</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sample_price">Sample Price ($)</Label>
                    <Input
                      id="samplePrice"
                      name="samplePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={quoteForm.samplePrice || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moq">MOQ (units)</Label>
                    <Input
                      id="moq"
                      name="moq"
                      type="number"
                      min="1"
                      value={quoteForm.moq || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time</Label>
                  <Select value={quoteForm.leadTime} onValueChange={handleLeadTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="3 weeks">3 weeks</SelectItem>
                      <SelectItem value="4 weeks">4 weeks</SelectItem>
                      <SelectItem value="5-6 weeks">5-6 weeks</SelectItem>
                      <SelectItem value="7-8 weeks">7-8 weeks</SelectItem>
                      <SelectItem value="8+ weeks">8+ weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Creator</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Provide additional details about your quote, materials, or production process..."
                    rows={4}
                    value={quoteForm.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending Quote..." : "Send Quote"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
