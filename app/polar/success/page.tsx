"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

/**
 * Polar Payment Success Page
 *
 * This page is shown after a successful Polar checkout.
 * It displays a success message and redirects to the dashboard.
 */
export default function PolarSuccessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 100);

    // Redirect after showing success
    const redirectTimer = setTimeout(() => {
      toast({
        variant: "default",
        title: "Payment successful!",
        description: "Your credits have been added to your account.",
      });

      router.refresh();
      router.push("/creator-dashboard");
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="container flex min-h-[80vh] items-center justify-center px-4 bg-[#F2F0EE]">
      <Card className="w-full max-w-md border-stone-200 bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
            <CheckCircle className="h-10 w-10 text-[#1C1917]" />
          </div>
          <CardTitle className="text-2xl text-[#1C1917]">Payment Successful!</CardTitle>
          <CardDescription className="text-base text-stone-600">
            Your credits have been added to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} className="h-2 w-full [&>div]:bg-[#1C1917]" />

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-[#1C1917]">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Thank you for your purchase!</h3>
                <p className="mt-1 text-sm text-stone-600">
                  Your credits are now available. You'll be redirected to your dashboard shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <CheckCircle className="h-4 w-4 text-[#1C1917]" />
                <span>Payment processed</span>
              </div>
              <span className="font-medium text-[#1C1917]">Done</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <CheckCircle className="h-4 w-4 text-[#1C1917]" />
                <span>Credits added to account</span>
              </div>
              <span className="font-medium text-[#1C1917]">Done</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <Loader2 className="h-4 w-4 animate-spin text-[#1C1917]" />
                <span>Redirecting to dashboard</span>
              </div>
              <span className="text-stone-500">In progress...</span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-stone-500">
            <p>You will be redirected automatically.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
