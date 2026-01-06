"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Mail, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock RFQ data with responses
const mockRFQ = {
  id: "rfq-001",
  title: "Eco-friendly Cotton T-shirt",
  status: "open",
  createdAt: "2025-04-01T10:30:00Z",
  techPack: {
    id: "tp-001",
    name: "Eco-friendly Cotton T-shirt",
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  productIdea:
    "Sustainable cotton t-shirt with minimalist design, focusing on eco-friendly materials and ethical production.",
  timeline: "2-3 weeks",
  quantity: 50,
  budget: 15,
  responses: [
    {
      id: "resp-001",
      supplier: {
        id: "sup-001",
        name: "EcoTextiles Manufacturing",
        location: "Portugal",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4.8,
      },
      samplePrice: 18.5,
      bulkPrice: 12.75,
      leadTime: "3 weeks",
      moq: 100,
      message:
        "We can produce these t-shirts with our organic cotton. The price is slightly higher than your target due to the premium materials, but we offer volume discounts for orders over 500 units.",
      receivedAt: "2025-04-03T14:20:00Z",
      status: "received",
    },
    {
      id: "resp-002",
      supplier: {
        id: "sup-002",
        name: "Sustainable Fabrics Co.",
        location: "Vietnam",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4.5,
      },
      samplePrice: 14.25,
      bulkPrice: 10.5,
      leadTime: "4 weeks",
      moq: 200,
      message:
        "We can meet your specifications with our recycled cotton blend. Our pricing is competitive and we can work with you on the timeline if needed.",
      receivedAt: "2025-04-02T09:15:00Z",
      status: "received",
    },
    {
      id: "resp-003",
      supplier: {
        id: "sup-003",
        name: "Premium Materials Ltd.",
        location: "Italy",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4.9,
      },
      samplePrice: 22.0,
      bulkPrice: 16.75,
      leadTime: "2 weeks",
      moq: 50,
      message:
        "We specialize in premium eco-friendly materials and can deliver high-quality samples within 2 weeks. Our pricing reflects the premium quality and faster turnaround time.",
      receivedAt: "2025-04-04T11:30:00Z",
      status: "received",
    },
  ],
};

export default function RFQResponsesPage() {
  const router = useRouter();
  const params = useParams();
  const rfqId = params.id as string;

  // In a real app, this would be fetched from an API
  const rfq = mockRFQ;

  const [selectedResponse, setSelectedResponse] = useState(rfq.responses[0]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/creator-dashboard/rfqs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to RFQs
        </Button>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Quotes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Details</CardTitle>
              <CardDescription>Created on {new Date(rfq.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#1C1917]">Title</h3>
                <p>{rfq.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#1C1917]">Tech Pack</h3>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={rfq.techPack.thumbnail || "/placeholder.svg"}
                    alt={rfq.techPack.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span>{rfq.techPack.name}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#1C1917]">Timeline</h3>
                <p>{rfq.timeline}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#1C1917]">Quantity</h3>
                <p>{rfq.quantity} units</p>
              </div>

              {rfq.budget && (
                <div>
                  <h3 className="text-sm font-medium text-[#1C1917]">Target Price</h3>
                  <p>${rfq.budget.toFixed(2)} per unit</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-[#1C1917]">Responses</h3>
                <p>{rfq.responses.length} supplier quotes received</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Quotes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {rfq.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedResponse.id === response.id ? "bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedResponse(response)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={response.supplier.avatar || "/placeholder.svg"}
                            alt={response.supplier.name}
                          />
                          <AvatarFallback>{response.supplier.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{response.supplier.name}</p>
                          <p className="text-xs text-[#1C1917]">{response.supplier.location}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        ${response.samplePrice.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedResponse.supplier.avatar || "/placeholder.svg"}
                        alt={selectedResponse.supplier.name}
                      />
                      <AvatarFallback>{selectedResponse.supplier.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedResponse.supplier.name}
                  </CardTitle>
                  <CardDescription>
                    Quote received on {new Date(selectedResponse.receivedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#1C1917]">Rating:</span>
                  <span className="font-medium">{selectedResponse.supplier.rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-[#1C1917]">Sample Price</p>
                  <p className="text-xl font-bold">${selectedResponse.samplePrice.toFixed(2)}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-[#1C1917]">Bulk Price</p>
                  <p className="text-xl font-bold">${selectedResponse.bulkPrice.toFixed(2)}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-[#1C1917]">Lead Time</p>
                  <p className="text-xl font-bold">{selectedResponse.leadTime}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-[#1C1917]">MOQ</p>
                  <p className="text-xl font-bold">{selectedResponse.moq} units</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Message from Supplier</h3>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p>{selectedResponse.message}</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-4">Price Comparison</h3>
                <div className="relative pt-2">
                  <div className="absolute left-0 top-0 w-full h-0.5 bg-muted"></div>
                  <div
                    className="absolute left-0 top-0 h-0.5 bg-blue-500"
                    style={{ width: `${(rfq.budget / 25) * 100}%`, maxWidth: "100%" }}
                  ></div>
                  <div
                    className="absolute top-0 transform -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${(rfq.budget / 25) * 100}%`, maxWidth: "100%" }}
                  >
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Target: ${rfq.budget.toFixed(2)}
                    </div>
                  </div>

                  {rfq.responses.map((response, index) => (
                    <div
                      key={response.id}
                      className="absolute top-0 transform -translate-y-1/2 -translate-x-1/2"
                      style={{
                        left: `${(response.bulkPrice / 25) * 100}%`,
                        maxWidth: "100%",
                        top: index === 0 ? "-24px" : index === 1 ? "24px" : "0",
                      }}
                    >
                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          selectedResponse.id === response.id
                            ? "bg-green-100 text-green-800 font-medium"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        ${response.bulkPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-12"></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Message Supplier
              </Button>
              <div className="space-x-2">
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" />
                  Decline Quote
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-2 h-4 w-4" />
                  Accept Quote
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
