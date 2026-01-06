"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  VisuallyHidden,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import PaypalCustomCard from "@/components/paypal-card/page";
// import SupplierPricingSection from "./paypal-card/supplier-payments-card";
import SupplierPlans from "@/components/modals/supplier-payment-card";

interface GenpireEditorGuideProps {
  showPaymentModal: boolean;
  setShowPaymentModal: React.Dispatch<boolean>;
  userRole?: string;
}

const GenpirePaymentModal: React.FC<GenpireEditorGuideProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  userRole,
}) => {
  return (
    <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <AlertDialogContent className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-lg border p-0 shadow-lg">
        <VisuallyHidden>
          <AlertDialogTitle>Payment Options</AlertDialogTitle>
        </VisuallyHidden>
        <div className="p-4">
          <div className="px-2 sm:p-0 py-0 flex justify-end">
            <button onClick={() => setShowPaymentModal(false)} className="text-black hover:text-black font-medium">
              <X className="h-4 w-4" />
            </button>
          </div>

          {userRole !== "supplier" ? <PaypalCustomCard /> : <SupplierPlans />}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GenpirePaymentModal;
