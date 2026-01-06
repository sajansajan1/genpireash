"use client";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Volkhov } from "next/font/google";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/zustand/useStore";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface ConfirmationStepProps {
  onPrevStep?: () => void;
  submissionResult: any;
}

export function ConfirmationStep({ onPrevStep, submissionResult }: ConfirmationStepProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, clear } = useUserStore();
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      clear();
      window.location.assign("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!submissionResult) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <h2 className={`text-2xl font-bold mb-2 `}>Processing Your Application</h2>
        <p className="text-[#1C1917]">Please wait while we process your submission...</p>
      </div>
    );
  }

  const isSuccess = submissionResult.success;
  const isDemo = submissionResult.demo;
  const warning = submissionResult.warning;
  const error = submissionResult.error;

  return (
    <div className="text-center py-8">
      {isSuccess ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className={`text-2xl font-bold mb-4 `}>Application Submitted Successfully!</h2>
          <p className="text-[#1C1917] mb-6 max-w-lg mx-auto">
            Thank you for applying to become a Genpire supplier. Our team will review your application and get back to
            you within 3-5 business days.
          </p>

          {isDemo && (
            <Alert className="mb-6 text-left max-w-lg mx-auto bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Demo Submission</AlertTitle>
              <AlertDescription className="text-amber-700">
                This was a demo submission. In a real environment, your application would be saved to our database.
              </AlertDescription>
            </Alert>
          )}

          {warning && (
            <Alert className="mb-6 text-left max-w-lg mx-auto bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Important Note</AlertTitle>
              <AlertDescription className="text-amber-700">{warning}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 rounded-lg p-6 max-w-lg mx-auto mb-8">
            <h3 className="text-lg font-semibold mb-2">What happens next?</h3>
            <ol className="text-sm text-[#1C1917] text-left space-y-2 list-decimal pl-5">
              <li>Our team will review your application (typically within 5-7 business days)</li>
              <li>You may be contacted for additional information or clarification</li>
              <li>If approved, you'll receive an email with next steps to complete your onboarding</li>
              <li>Once onboarded, you'll start receiving quote requests that match your capabilities</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="default" onClick={handleSignOut} disabled={isLoggingOut}>
              {isLoggingOut ? "Returning to Home..." : "Return to Home"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className={`text-2xl font-bold mb-4 `}>Submission Error</h2>
          <p className="text-[#1C1917] mb-6 max-w-lg mx-auto">
            We encountered an error while submitting your application. Please try again or contact support if the issue
            persists.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6 text-left max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {onPrevStep && (
              <Button onClick={onPrevStep} variant="default">
                Go Back and Try Again
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="mailto:support@genpire.com">Contact Support</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
