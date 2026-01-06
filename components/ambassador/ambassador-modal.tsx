import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCreatePayoutAmbassadorStore } from "@/lib/zustand/ambassador/createPayoutAmbassador";
import { useGetAmbassadorStore } from "@/lib/zustand/ambassador/getAmbassador";
import Image from "next/image";
interface AmbassadorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AmbassadorPayoutOptionsModal({ isOpen, onClose }: AmbassadorModalProps) {
  const [activeTab, setActiveTab] = useState<"paypal" | "bank">("paypal");
  const { setCreatePayoutAmbassador } = useCreatePayoutAmbassadorStore();
  const { refreshGetAmbassador, fetchGetAmbassador } = useGetAmbassadorStore();
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState<"paypal" | "bank" | false>(false);
  const [bankDetails, setBankDetails] = useState({
    fullName: "",
    country: "",
    currency: "",
    bankName: "",
    branchAddress: "",
    accountNumber: "",
    swiftCode: "",
    routingNumber: "",
    taxId: "",
  });

  const handleBankChange = (field: string, value: string) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // setLoading(true);
    try {
      if (activeTab === "paypal") {
        if (!paypalEmail) {
          alert("Please enter your PayPal email address.");
          return;
        }
        setLoading("paypal");
        const { success, error } = await setCreatePayoutAmbassador({
          email: paypalEmail,
          name: "",
          residence: "",
          currency: "",
          bank_name: "",
          bank_address: "",
          bank_account: "",
          swift_code: "",
          bank_routing_number: "",
          payer_id: "",
          status: true,
        });
        if (success) {
          console.log(success, "PayPal payout details saved successfully");
          await fetchGetAmbassador();
        }
        if (error) throw new Error(error);
      } else {
        // Validate a few key fields for bank details
        if (
          !bankDetails.fullName ||
          !bankDetails.country ||
          !bankDetails.currency ||
          !bankDetails.bankName ||
          !bankDetails.accountNumber ||
          !bankDetails.swiftCode
        ) {
          alert("Please fill in all required bank details.");
          return;
        }
        setLoading("bank");
        const { success, error } = await setCreatePayoutAmbassador({
          email: paypalEmail || "",
          name: bankDetails.fullName || "",
          residence: bankDetails.country || "",
          currency: bankDetails.currency || "",
          bank_name: bankDetails.bankName || "",
          bank_address: bankDetails.branchAddress || "",
          bank_account: bankDetails.accountNumber || "",
          swift_code: bankDetails.swiftCode || "",
          bank_routing_number: bankDetails.routingNumber || "",
          payer_id: bankDetails.taxId || "",
          status: true,
        });

        if (error) throw new Error(error);
        if (success) {
          console.log(success, "Bank payout details saved successfully");
          await refreshGetAmbassador();
        }
      }
    } catch (err) {
      console.error("Error saving payout info:", err);
      alert("Failed to save payout details. Please try again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg lg:max-w-4xl p-0 bg-white border rounded-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left Visual Section */}
          <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-stone-100 to-stone-200">
            <div className="absolute inset-0 bg-black/20" />
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_eakfnaeakfnaeakf-VpHOOnlw8mcfuBu92v3l5zj1qEV0PH.png"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Set Up Your Payout</h3>
              <p className="text-white/90 max-w-sm">
                Choose how you’d like to receive your payouts securely and conveniently.
              </p>
            </div>
          </div>

          {/* Right Content Section (Scroll-enabled) */}
          <div className="flex-1 lg:w-1/2 flex flex-col justify-start p-6 sm:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
            <DialogTitle className="text-2xl font-bold text-zinc-900 mb-2">Payout Options</DialogTitle>
            <DialogDescription className="text-stone-600 mb-6">
              Select your preferred payout method and provide the necessary details below.
            </DialogDescription>

            <Tabs
              defaultValue={activeTab}
              onValueChange={(val) => setActiveTab(val as "paypal" | "bank")}
              className="flex flex-col flex-1"
            >
              <TabsList className="grid grid-cols-2 w-full bg-stone-100 rounded-lg p-1 border border-stone-200 mb-6">
                <TabsTrigger
                  value="paypal"
                  className="flex items-center gap-2 rounded-md text-sm font-medium text-zinc-700 transition-all duration-200 hover:bg-white data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                >
                  <Image src="/paypal-svg.svg" alt="PayPal" width={20} height={20} />
                  PayPal
                </TabsTrigger>
                <TabsTrigger
                  value="bank"
                  className="flex items-center gap-2 rounded-md text-sm font-medium text-zinc-700 transition-all duration-200 hover:bg-white data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                >
                  <Image src="/bank-svg.svg" alt="bank" width={20} height={20} />
                  <span>Bank Account</span>
                </TabsTrigger>
              </TabsList>

              {/* PayPal Tab */}
              <TabsContent value="paypal" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="paypal-email" className="font-medium text-sm">
                      PayPal Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="paypal-email"
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="Enter your PayPal email"
                      className="h-11 text-sm"
                      required
                    />
                  </div>

                  <div className="text-xs text-zinc-500 bg-stone-50 rounded-lg p-3 border border-stone-200">
                    Make sure this email matches your verified PayPal account.
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={loading === "paypal"}
                    className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Image src="/paypal-svg.svg" alt="PayPal" width={20} height={20} className="w-5 h-5" />
                    {loading === "paypal" ? "Saving..." : "Save PayPal Details"}
                  </Button>
                </motion.div>
              </TabsContent>

              {/* Bank Account Tab */}
              <TabsContent value="bank" className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  {[
                    { label: "Full Legal Name of Payee", id: "fullName", required: true },
                    { label: "Country of Residence", id: "country", required: true },
                    { label: "Currency for Payout", id: "currency", required: true },
                    { label: "Bank Name", id: "bankName", required: true },
                    { label: "Bank Branch Address (optional)", id: "branchAddress" },
                    { label: "Bank Account Number / IBAN", id: "accountNumber", required: true },
                    { label: "SWIFT/BIC Code", id: "swiftCode", required: true },
                    { label: "Bank Routing Number (if applicable)", id: "routingNumber" },
                    { label: "Payee’s Tax ID or National ID (if required)", id: "taxId" },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="font-medium text-sm text-zinc-900">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={field.id}
                        type="text"
                        value={bankDetails[field.id as keyof typeof bankDetails]}
                        onChange={(e) => handleBankChange(field.id, e.target.value)}
                        required={field.required}
                        className="h-11 text-sm"
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={loading === "bank"}
                    className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm"
                  >
                    <Image src="/bank-svg.svg" alt="PayPal" width={20} height={20} className="text-white" />
                    {loading === "bank" ? "Saving..." : "Save Bank Details"}
                  </Button>
                </motion.form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
