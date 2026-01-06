"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, DollarSign, Coins, Copy, Share2, MessageCircle, CheckCircle2, Loader2, Slack } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useGetAmbassadorStore } from "@/lib/zustand/ambassador/getAmbassador";
import AmbassadorPayoutOptionsModal from "@/components/ambassador/ambassador-modal";
import { useCreatePayoutAmbassadorStore } from "@/lib/zustand/ambassador/createPayoutAmbassador";
import { supabase } from "@/lib/supabase/client";

export default function FriendsDashboard() {
  const [paypalConnected, setPaypalConnected] = useState(false);
  const [openPayoutModal, setOpenPayoutModal] = useState(false);
  const { fetchGetAmbassador, GetAmbassador, loadingGetAmbassador, errorGetAmbassador } = useGetAmbassadorStore();
  console.log("GetAmbassador ==> ", GetAmbassador);
  useEffect(() => {
    if (!GetAmbassador) {
      fetchGetAmbassador();
    }
  }, [fetchGetAmbassador, GetAmbassador]);

  useEffect(() => {
    if (GetAmbassador && GetAmbassador?.payoutDetails?.status) {
      setPaypalConnected(true);
    }
  }, [GetAmbassador]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Genpire",
        text: "Check out Genpire - AI-powered product creation platform",
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  if (!GetAmbassador || loadingGetAmbassador || errorGetAmbassador) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Loading Ambassador...</span>
      </div>
    );
  }
  console.log(GetAmbassador, "getteeeeeeeeeeeee");

  const referralLink = `https://www.genpire.com/?${GetAmbassador?.referralCode}`;

  const handleUpdateStatus = async (status: boolean) => {
    console.log("Updating status to:", status);
    try {
      const { error } = await supabase
        .from("ambassador_details")
        .update({ status: status })
        .eq("id", GetAmbassador?.payoutDetails?.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Your payout status has been successfully updated.",
      });

      await fetchGetAmbassador();
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNextBillingDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Billing date is always the 10th
    let billingDate = new Date(currentYear, currentMonth, 10);

    // If today is after the 10th, move to next month’s 10th
    if (now.getDate() > 10) {
      billingDate = new Date(currentYear, currentMonth + 1, 10);
    }

    return billingDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">👋 Friends of Genpire</h1>
            <p className="text-lg text-stone-600">
              Track your referrals, rewards, and payouts as part of our ambassador community.
            </p>
          </div>

          {/* Right Side: Date Info */}
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-stone-500">
              Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-sm font-medium text-stone-700">Next Billing Date: {getNextBillingDate()}</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of referrals to-date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-stone-900">{GetAmbassador?.totalReferrals || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Number of paid referrals to-date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-stone-900">{GetAmbassador?.totalPaidReferrals || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-stone-900">${GetAmbassador?.totalPurchaseCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Number of total referrals fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-stone-900">${GetAmbassador?.totalRefferralsFee || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Setup Card */}
        <Card className="bg-white border-stone-200 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-stone-900">Connect Your PayPal Account</CardTitle>
            <CardDescription className="text-stone-600">
              Please connect your PayPal account to receive payouts from Genpire. When connected, you'll see a green dot
              indicating your account is active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <>
              <p className="text-sm font-semibold text-stone-700 pb-4">
                {" "}
                Ambassador rewards are paid monthly, based on the number of referred users who become paying Genpire
                customers. Payouts are processed within 10 business days after the end of each month. This ensures all
                referrals and transactions are fully verified — and you receive accurate rewards every time. Thank you
                for helping us bring more ideas to life.
              </p>
              <div className="flex items-center gap-4">
                {/* {GetAmbassador?.payoutDetails?.status ? (
                // Account already exists
                <Button
                  onClick={async () => {
                    // Toggle local state
                    setPaypalConnected(!paypalConnected);
                    await handleUpdateStatus(!paypalConnected); // Pass the new status
                  }}
                  className="rounded-xl transition-all"
                  variant={paypalConnected ? "default" : "outline"}
                >
                  {paypalConnected ? "🔗 PayPal Connected" : "🔗 PayPal Inactive"}
                </Button>
              ) : (
                // No account yet — open modal
                <Button
                  onClick={() => setOpenPayoutModal(true)}
                  className="rounded-xl transition-all"
                  variant="default"
                >
                  🔗 Connect PayPal
                </Button>
              )} */}
                <Button
                  onClick={() => {
                    GetAmbassador?.payoutDetails ? setPaypalConnected(!paypalConnected) : setOpenPayoutModal(true);
                  }}
                  className="rounded-xl"
                  disabled={GetAmbassador?.payoutDetails?.status ? true : false}
                  variant="default"
                >
                  {paypalConnected ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      PayPal Connected
                    </>
                  ) : (
                    <>🔗 Add Pay-out Method</>
                  )}
                </Button>
                {paypalConnected && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                    Account Active
                  </div>
                )}
              </div>
            </>
          </CardContent>
        </Card>

        {/* Referral Code Card */}
        <Card className="bg-white border-stone-200 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-stone-900">Your Unique Referral Code</CardTitle>
            <CardDescription className="text-stone-600">
              Everyone who joins Genpire using your unique link receives a 25% credit boost on their first purchase —
              whether they choose Pay-As-You-Go or a subscription package. More credits = more products created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={GetAmbassador?.referralCode ? referralLink : "https://www.genpire.com"}
                readOnly
                className="flex-1 bg-stone-50 border-stone-200"
              />
              <Button size="icon" variant="outline" onClick={handleCopyLink} className="shrink-0 bg-transparent">
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={handleShareLink} className="shrink-0 bg-transparent">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="bg-white border-stone-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-stone-900 flex items-center gap-2">
              <Slack className="h-5 w-5" />
              Join our Friend's Slack Channel
            </CardTitle>
            <CardDescription className="text-stone-600">
              Get updates and join discussion about Genpire's new features and new announcements about our product,
              activity and affiliates program.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="rounded-xl"
              onClick={() =>
                window.open("https://limalabsworkspace.slack.com/archives/C09Q7U1HKS4", "_blank", "noopener,noreferrer")
              }
            >
              <Slack className="h-5 w-5 mr-2" />
              Join the Group
            </Button>
          </CardContent>
        </Card>
      </div>
      {openPayoutModal && (
        <AmbassadorPayoutOptionsModal isOpen={openPayoutModal} onClose={() => setOpenPayoutModal(false)} />
      )}
    </div>
  );
}
