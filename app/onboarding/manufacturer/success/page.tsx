"use client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Volkhov } from "next/font/google";
import { useState } from "react";
import { useUserStore } from "@/lib/zustand/useStore";
import { supabase } from "@/lib/supabase/client";
const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

const ShowSupplierStatus = () => {
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

  return (
    <div className="text-center py-8">
      <>
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold mb-4 `}>Application Submitted Successfully!</h2>
        <p className="text-[#1C1917] mb-6 max-w-lg mx-auto">
          Thank you for applying to become a Genpire supplier. Our team will review your application and get back to you
          within 3-5 business days.
        </p>

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
    </div>
  );
};

export default ShowSupplierStatus;
