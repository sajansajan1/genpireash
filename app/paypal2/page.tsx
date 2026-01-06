"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Suspense } from "react";

export function PaymentProcessingPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
          </div>
          <CardTitle className="text-2xl">Payment Processing</CardTitle>
          <CardDescription className="text-base">Your payment is being processed. Please wait...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={45} className="h-2 w-full" />

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Please don't close this tab</h3>
                <p className="mt-1 text-sm">
                  Closing or changing this tab may interrupt your payment. Please wait until the process is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <CreditCard className="h-4 w-4" />
                <span>Verifying payment details</span>
              </div>
              <span className="text-green-600">✓</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground text-[10px]">
                  2
                </span>
                <span>Processing transaction</span>
              </div>
              <div className="flex h-4 w-4 items-center justify-center">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
              </div>
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground text-[10px]">
                  3
                </span>
                <span>Confirming payment</span>
              </div>
              <div className="h-4 w-4"></div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#1C1917]">
            <p>This usually takes less than a minute.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PayPalSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");

    if (!status) {
      toast({
        variant: "destructive",
        title: "Missing payment status.",
      });
      router.push("/creator-dashboard");
      return;
    }

    // Wait 2.5 seconds before redirecting
    const timer = setTimeout(() => {
      if (status === "success") {
        toast({
          variant: "default",
          title: "Payment successful!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Payment was cancelled.",
        });
      }

      router.refresh();
      router.push("/creator-dashboard");
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer); // clean up on unmount
  }, [searchParams, router]);

  return <PaymentProcessingPage />;
}

export default function PayPalPageWrapper() {
  return (
    <Suspense fallback={<PaymentProcessingPage />}>
      <PayPalSuccessPageContent />
    </Suspense>
  );
}
