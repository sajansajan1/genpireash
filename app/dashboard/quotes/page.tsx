import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, ExternalLink, MessageSquare, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function QuotesPage() {
  // Sample quotes data
  const quotes = [
    {
      id: "1",
      productName: "Custom Eco-Friendly Sneakers",
      supplierName: "EcoFabric Manufacturing",
      supplierLocation: "Vietnam",
      status: "Awaiting Response",
      sentDate: "March 28, 2025",
      expectedResponse: "April 4, 2025",
      image: "/placeholder.svg?height=200&width=300&text=Eco+Sneakers",
    },
    {
      id: "2",
      productName: "Minimalist Backpack",
      supplierName: "GreenStep Productions",
      supplierLocation: "Portugal",
      status: "Quote Received",
      sentDate: "March 15, 2025",
      responseDate: "March 22, 2025",
      price: "$18.50 per unit",
      moq: "200 units",
      leadTime: "3 weeks",
      image: "/placeholder.svg?height=200&width=300&text=Backpack",
    },
    {
      id: "3",
      productName: "Bamboo Sunglasses",
      supplierName: "Sustainable Soles Inc.",
      supplierLocation: "Mexico",
      status: "Sample Shipped",
      sentDate: "February 28, 2025",
      responseDate: "March 5, 2025",
      sampleShipped: "March 20, 2025",
      trackingNumber: "USPS12345678",
      estimatedDelivery: "April 5, 2025",
      image: "/placeholder.svg?height=200&width=300&text=Sunglasses",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight `}>Quotes & Samples</h1>
          <p className="text-[#1C1917] mt-1">Track your supplier quotes and sample requests.</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="all">All Quotes (3)</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting (1)</TabsTrigger>
          <TabsTrigger value="received">Received (1)</TabsTrigger>
          <TabsTrigger value="samples">Samples (1)</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </TabsContent>

        <TabsContent value="awaiting" className="space-y-6">
          {quotes
            .filter((q) => q.status === "Awaiting Response")
            .map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
        </TabsContent>

        <TabsContent value="received" className="space-y-6">
          {quotes
            .filter((q) => q.status === "Quote Received")
            .map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          {quotes
            .filter((q) => q.status === "Sample Shipped")
            .map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QuoteCardProps {
  quote: any;
}

function QuoteCard({ quote }: QuoteCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Awaiting Response":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Quote Received":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Sample Shipped":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <div className="p-4 md:p-6 md:border-r">
            <div className="flex flex-row md:flex-col items-center md:items-start gap-4 mb-4">
              <div className="aspect-video w-24 md:w-full overflow-hidden rounded-md mb-0 md:mb-4 flex-shrink-0">
                <img
                  src={quote.image || "/placeholder.svg"}
                  alt={quote.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-1">{quote.productName}</h3>
                <div className="flex items-center mb-2">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    {quote.supplierName}, <span className="text-[#1C1917]">{quote.supplierLocation}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-3 p-4 md:p-6 border-t md:border-t-0">
            {quote.status === "Awaiting Response" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium">Request for Quote</h4>
                    <p className="text-sm text-[#1C1917]">Your quote request was sent on {quote.sentDate}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Spec Sheet
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-[#1C1917]" />
                    <span className="text-sm">Expected response by {quote.expectedResponse}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-4 w-4" /> Message Supplier
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Cancel Request
                  </Button>
                </div>
              </div>
            )}

            {quote.status === "Quote Received" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium">Quote Details</h4>
                    <p className="text-sm text-[#1C1917]">Response received on {quote.responseDate}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Full Quote
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-sm text-[#1C1917] mb-1">Unit Price</div>
                    <div className="font-semibold">{quote.price}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-sm text-[#1C1917] mb-1">Min. Order</div>
                    <div className="font-semibold">{quote.moq}</div>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-sm text-[#1C1917] mb-1">Lead Time</div>
                    <div className="font-semibold">{quote.leadTime}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="w-full sm:w-auto">
                    <ThumbsUp className="mr-2 h-4 w-4" /> Order Sample
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-4 w-4" /> Negotiate
                  </Button>
                </div>
              </div>
            )}

            {quote.status === "Sample Shipped" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium">Sample Tracking</h4>
                    <p className="text-sm text-[#1C1917]">Sample shipped on {quote.sampleShipped}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Track Package
                    </a>
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                    <span className="text-sm">Tracking Number:</span>
                    <span className="font-medium">{quote.trackingNumber}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-4">
                    <span className="text-sm">Estimated Delivery:</span>
                    <span className="font-medium">{quote.estimatedDelivery}</span>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between mb-2 text-xs">
                      <span>Shipped</span>
                      <span>In Transit</span>
                      <span>Delivered</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "50%" }}></div>
                    </div>
                    <div className="absolute top-0 left-0 w-full flex justify-between -mt-1">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                      <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="w-full sm:w-auto">
                    <ThumbsUp className="mr-2 h-4 w-4" /> Approve & Order
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-4 w-4" /> Request Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
