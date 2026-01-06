import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Download, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function BillingPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${volkhov.className}`}>Billing & Plan</h1>
          <p className="text-[#1C1917] mt-1">Manage your subscription and payment methods</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className={volkhov.className}>Current Plan</CardTitle>
            <CardDescription>You are currently on the Pro plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold">Pro Plan</h3>
                  <Badge className="ml-2 bg-primary">Current</Badge>
                </div>
                <p className="text-[#1C1917] mt-1">Billed monthly • Renews on April 15, 2025</p>
              </div>
              <div className="mt-4 md:mt-0 text-2xl font-bold">
                $49<span className="text-[#1C1917] text-sm font-normal">/month</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Product Specs</span>
                  <span className="text-sm">7 used of 10</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Supplier Matches</span>
                  <span className="text-sm">Unlimited</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Team Members</span>
                  <span className="text-sm">2 used of 3</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>Advanced AI generation</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>Priority support</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>Custom material library</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Cancel Subscription
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={volkhov.className}>Payment Method</CardTitle>
            <CardDescription>Manage your payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-[#1C1917]" />
                  <span className="font-medium">Visa ending in 4242</span>
                </div>
                <Badge>Default</Badge>
              </div>
              <div className="text-sm text-[#1C1917]">
                <div>Expires 09/2026</div>
                <div className="mt-1">Alex Lee</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Billing History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "March 15, 2025", amount: "$49.00", status: "Paid" },
                  { date: "February 15, 2025", amount: "$49.00", status: "Paid" },
                  { date: "January 15, 2025", amount: "$49.00", status: "Paid" },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium">Pro Plan - Monthly</div>
                      <div className="text-sm text-[#1C1917]">{invoice.date}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div>{invoice.amount}</div>
                        <Badge variant="outline" className="mt-1">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download invoice</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Usage Statistics</CardTitle>
              <CardDescription>Track your resource usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Product Specs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">7</div>
                        <p className="text-sm text-[#1C1917]">Used this month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-sm text-[#1C1917]">Remaining</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">23</div>
                        <p className="text-sm text-[#1C1917]">Total used</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Supplier Quotes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-sm text-[#1C1917]">Quotes requested</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-sm text-[#1C1917]">Quotes received</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-sm text-[#1C1917]">Samples ordered</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
