"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createPayment, createSubscription } from "../actions/paypal";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { oneTimePlans, monthlyPlans, yearlyPlans } from "@/lib/utils/payments";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function PaypalCustomCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceParam = searchParams.get("price");
  const description = searchParams.get("des") ?? "";
  const planType = searchParams.get("plan_type") ?? "";
  const membership = searchParams.get("membership") ?? "";
  const price = Number.parseFloat(priceParam ?? "0");
  const offer = searchParams.get("offer") === "true";
  const cleanDescription = description.replace(/\s*credits?\s*$/i, "").trim();
  console.log("cleanDescription ==> ", description);

  if (isNaN(price) || price <= 0) {
    return (
      <div className="text-[#1C1917] text-center mt-10 bg-[#F2F0EE] min-h-screen flex items-center justify-center">
        Invalid payment request
      </div>
    );
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  // Decide plans array based on planType param
  let plansArray;
  if (planType === "yearly") {
    plansArray = yearlyPlans;
  } else if (planType === "one_time" || planType === "add_on") {
    plansArray = oneTimePlans;
  } else {
    plansArray = monthlyPlans;
  }

  // Find the selected plan by membership
  const selectedPlan = plansArray.find((plan) => plan.membership === membership) || plansArray[0];
  console.log("selectedPlan ==> ", selectedPlan);
  const planTypeLabels: any = {
    monthly: "💡 Monthly Plan",
    yearly: "🚀 Yearly Plan",
    one_time: "⚡ One-time Plan",
    add_on: "⚡ One-time Plan",
  };

  // Choose label based on planType or fallback
  const planLabel = planTypeLabels[planType] || "💡 Premium Plan";
  return (
    <div className="flex justify-center bg-[#F2F0EE] min-h-screen">
      <main className="min-h-screen flex flex-col lg:flex-row lg:w-4/5 xl:w-3/4 w-full">
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 py-8 lg:py-16 bg-[#F2F0EE] lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="mt-3 mb-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1C1917] text-white text-sm font-medium mb-4">
                {planLabel} - {selectedPlan.name}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-2 leading-tight">
                {cleanDescription} Genpire Credits
              </h1>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1C1917] mb-4">What's included in the {selectedPlan.name}:</h3>
              <ul className="space-y-4">
                {selectedPlan.features.map((feature, idx) => {
                  const Icon = feature.icon;
                  const text = feature.text;

                  return (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1C1917] rounded-full flex items-center justify-center flex-shrink-0">
                        {Icon ? (
                          <Icon className="text-white w-4 h-4" />
                        ) : (
                          <span className="text-white font-semibold">✔️</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1917]">{text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-[#d3c7b9]/30 rounded-xl p-6 border border-[#d3c7b9] hidden lg:block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1C1917]/70 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-[#1C1917]">${price.toFixed(2)}</p>
                  <p className="text-sm text-[#1C1917]/60">USD</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1C1917] text-white text-sm font-medium">
                    ✨ Best Value
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mt-4">
              <Button variant="default" onClick={() => router.push("/creator-dashboard")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-[#F2F0EE] px-6 md:px-12 py-8 lg:py-16 lg:border-l border-[#d3c7b9] lg:overflow-y-auto">
          <div className="max-w-md mx-auto">
            <div className="bg-[#F2F0EE] rounded-2xl shadow-lg border border-[#d3c7b9] p-8">
              <h2 className="text-xl font-bold text-[#1C1917] mb-6 text-center">Complete Your Order</h2>

              <div className="bg-[#d3c7b9]/30 rounded-lg p-4 mb-6 border border-[#d3c7b9]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#1C1917]">Order Total</span>
                  <span className="text-2xl font-bold text-[#1C1917]">${price.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-center text-sm text-[#1C1917]/70 mb-4">Secure checkout with PayPal</p>
                {planType === "monthly" || planType === "yearly" ? (
                  // Monthly subscription ($49)
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: "USD",
                      vault: true,
                      intent: "subscription",
                      components: "buttons",
                      enableFunding: "card",
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        height: 50,
                      }}
                      createSubscription={async () => {
                        // Call your backend to create subscription
                        const res = await createSubscription({ price, des: description });

                        console.log("res ==> ", res);
                        const subscription = res.id;
                        return subscription;
                      }}
                      onApprove={async (data, actions) => {
                        const subscriptionRes = await fetch(`/api/paypal-subscription`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            subscriptionID: data.subscriptionID,
                            price: price,
                            membership: membership,
                            planType: planType,
                          }),
                        });
                        const result = await subscriptionRes.json();
                        if (result.success) {
                          router.push("/paypal2?status=success");
                        } else {
                          router.push("/paypal2?status=failed");
                          console.error(result.error);
                        }
                      }}
                      onCancel={() => {
                        toast({
                          title: "Subscription Canceled!",
                          description: "Your subscription was canceled! Please try again",
                        });
                      }}
                      onError={(err) => {
                        router.push("/paypal2?status=failed");
                        console.error("PayPal subscription error", err);
                      }}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        height: 50,
                      }}
                      createOrder={async () => {
                        const res = await createPayment({ price, des: description });
                        console.log("res ==> ", res);
                        const order = res.id;
                        return order;
                      }}
                      onApprove={async (data, actions) => {
                        const captureRes = await fetch(`/api/paypal-capture`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderID: data.orderID,
                            price: price,
                          }),
                        });

                        const result = await captureRes.json();
                        if (result.success) {
                          router.push("/paypal2?status=success");
                        } else {
                          router.push("/paypal2?status=failed");
                          console.error(result.error);
                        }
                      }}
                      onCancel={() => {
                        toast({
                          title: "Payment Canceled!",
                          description: "Your Payment was Canceled! Please try again",
                        });
                      }}
                      onError={(err) => {
                        router.push("/paypal2?status=failed");
                        console.error("PayPal error", err);
                      }}
                    />
                  </PayPalScriptProvider>
                )}
              </div>

              <div className="border-t border-[#d3c7b9] pt-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#1C1917] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs text-[#1C1917]/70">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#1C1917] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs text-[#1C1917]/70">Instant Access</span>
                  </div>
                </div>

                <p className="text-xs text-center text-[#1C1917]/60 leading-relaxed mb-4">
                  This product is offered and sold by Genpire. Secure payment processing by PayPal.
                </p>

                <div className="text-center text-[#1C1917] text-xs">
                  <a
                    className="underline font-medium hover:text-[#1C1917]/80"
                    href="https://www.paypal.com/US/cshelp/aupviolation"
                  >
                    Report this link
                  </a>
                  <span className="mx-2">|</span>
                  <a
                    className="underline font-medium hover:text-[#1C1917]/80"
                    href="https://www.paypal.com/webapps/mpp/ua/privacy-full"
                  >
                    Privacy Policy
                  </a>
                </div>

                <div className="flex items-center justify-center mt-4">
                  <p className="text-xs text-[#1C1917]/60 mr-2">Powered by</p>
                  <img
                    className="h-6 w-auto"
                    src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
                    alt="PayPal"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaypalCustomCheckoutPage;
