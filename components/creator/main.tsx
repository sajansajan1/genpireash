"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import IdeaUploadPage from "@/components/idea-upload/page";
import GenpirePaymentModal from "@/components/genpire-payment-modal";
import PersonalisedSignupModal from "@/components/personalised-signup-modal";
import { useUserStore } from "@/lib/zustand/useStore";
// import { EtsyConnectButton } from "@/components/integrations/etsy-connect-button";
// import { ShopifyConnectButton } from "@/components/integrations/shopify-connect-button";
// import { InsightsFeed } from "@/components/dashboard/insights-feed";

export default function CreatorDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { creatorProfile } = useUserStore();
  console.log("🔍 ~ CreatorDashboard ~ components/creator/main.tsx:31 ~ creatorProfile:", creatorProfile);

  // Open modal if onboarding=true is present
  useEffect(() => {
    const onboarding = searchParams.get("onboarding");
    if (onboarding === "true") {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  // Handler to close payment modal and open demo modal
  const handlePaymentModalClose = (isOpen: boolean) => {
    setShowPayment(isOpen);
    if (!isOpen) {
      // When payment modal closes, open demo modal
      setIsDemoModalOpen(true);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-2 pt-1 sm:pt-2  md:pt-2 bg-[#f5f4f0]">
      {/* <div className="flex justify-end px-2 gap-2">
        <EtsyConnectButton />
        <ShopifyConnectButton />
      </div> */}
      {/* <InsightsFeed /> */}
      <IdeaUploadPage />
      {/* Step 1: Personalised Signup Modal */}
      {showOnboarding && !creatorProfile?.experience && (
        <PersonalisedSignupModal
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            setShowPayment(true);
          }}
          onComplete={() => {
            setShowOnboarding(false);
            setShowPayment(true);
          }}
        />
      )}

      {/* Step 2: Payment Modal */}
      {showPayment && (
        <GenpirePaymentModal showPaymentModal={showPayment} setShowPaymentModal={handlePaymentModalClose} />
      )}
    </div>
  );
}
