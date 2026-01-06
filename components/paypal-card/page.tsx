"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Eye, PiggyBank, Crown, Users, Sparkles, ArrowRight, PartyPopper, Lightbulb, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming a Shadcn UI button
import { AuthModal } from "../auth/auth-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "../ui/label";
import { oneTimePlans, monthlyPlans, yearlyPlans, getCheckoutUrl, isPolarEnabled } from "@/lib/utils/payments";
import { POLAR_PRODUCTS } from "@/lib/polar/config";
import { usePathname } from "next/navigation";
import { Section } from "./paypal-section";
import { changeSubscriptionPlan } from "@/app/actions/change-subscription-plan";
import { track, AnalyticsEvents } from "@/lib/analytics";

export const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useUserStore();
  const pathname = usePathname();
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  const isLoading = false; // Provider handles loading state
  const [showAll, setShowAll] = useState(false);
  const [showMagicText, setShowMagicText] = useState<boolean>(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [upgradeConfirmDialog, setUpgradeConfirmDialog] = useState<{
    isOpen: boolean;
    membership: string;
    planType: string;
    planName: string;
    newPrice: number;
    newCredits: number;
    isUpgrade: boolean;
  } | null>(null);
  useEffect(() => {
    if (!credits) {
      refresCreatorCredits();
    }
  }, [credits, refresCreatorCredits]);

  useEffect(() => {
    if (pathname === "/pricing") {
      setShowMagicText(false);
    }
  }, [pathname]);

  const handleBuy = ({
    price,
    description,
    membership,
    planType,
  }: {
    price: number | null;
    description: string;
    membership: string;
    planType: string;
  }) => {
    console.log(membership, "mee");

    if (price === null) {
      track(AnalyticsEvents.CTA_CLICK, {
        button_name: "Contact Sales",
        location: "pricing_section",
        plan: "enterprise",
      });
      window.location.assign("mailto:support@genpire.com");
      return;
    }

    // Track checkout initiation
    track(AnalyticsEvents.INITIATE_CHECKOUT, {
      price,
      currency: "USD",
      membership,
      plan_type: planType,
      description,
    });

    // Get Polar product ID based on membership and plan type
    const polarProductKey = planType === "one_time"
      ? `credits_${membership}`
      : `${membership}_${planType}`;
    const polarProduct = POLAR_PRODUCTS[polarProductKey];

    const checkoutUrl = getCheckoutUrl({
      price,
      description,
      membership,
      planType,
      userId: user?.id,
      userEmail: user?.email,
      hasOffer: user?.offers ?? false,
      polarProductId: polarProduct?.id,
    });

    window.location.assign(checkoutUrl);
  };

  // Show confirmation dialog before upgrade
  const showUpgradeConfirmation = ({
    membership,
    planType,
    planName,
    newPrice,
    newCredits,
  }: {
    membership: string;
    planType: string;
    planName: string;
    newPrice: number;
    newCredits: number;
  }) => {
    const membershipOrder = { basic: 0, saver: 1, pro: 2, team: 3 };
    const currentOrder = membershipOrder[credits?.membership as keyof typeof membershipOrder] ?? 0;
    const planOrder = membershipOrder[membership as keyof typeof membershipOrder] ?? 0;
    const isUpgrade = planOrder > currentOrder;

    setUpgradeConfirmDialog({
      isOpen: true,
      membership,
      planType,
      planName,
      newPrice,
      newCredits,
      isUpgrade,
    });
  };

  // Execute the actual upgrade after confirmation
  const handleUpgradeConfirmed = async () => {
    if (!upgradeConfirmDialog || !credits?.subscription_id) {
      return;
    }

    const { membership, planType, isUpgrade, planName, newPrice } = upgradeConfirmDialog;
    setUpgradeConfirmDialog(null);

    // Track plan change attempt
    track(AnalyticsEvents.SUBSCRIBE, {
      action: isUpgrade ? "upgrade" : "downgrade",
      old_plan: credits?.membership,
      new_plan: membership,
      plan_type: planType,
      price: newPrice,
    });

    // Get Polar product ID for the new plan
    const polarProductKey = `${membership}_${planType}`;
    const polarProduct = POLAR_PRODUCTS[polarProductKey];

    if (!polarProduct?.id) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
      return;
    }

    setUpgradingPlan(membership);

    try {
      const result = await changeSubscriptionPlan({
        subscriptionId: credits.subscription_id,
        newProductId: polarProduct.id,
      });

      if (result.success) {
        // Track successful plan change
        track(AnalyticsEvents.PURCHASE, {
          transaction_type: isUpgrade ? "upgrade" : "downgrade",
          old_plan: credits?.membership,
          new_plan: membership,
          plan_name: planName,
          value: newPrice,
          currency: "USD",
        });

        toast({
          title: "Plan Changed Successfully",
          description: `You've been ${isUpgrade ? 'upgraded' : 'downgraded'} to ${result.newPlan?.name}. Changes take effect immediately.`,
        });
        refresCreatorCredits();
      } else {
        track(AnalyticsEvents.ERROR, {
          error_type: "plan_change_error",
          error_message: result.error || "Failed to change plan",
        });
        toast({
          title: "Error",
          description: result.error || "Failed to change plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      track(AnalyticsEvents.ERROR, {
        error_type: "plan_change_exception",
        error_message: "Unexpected error during plan change",
      });
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpgradingPlan(null);
    }
  };

  const plansToShow =
    billingPeriod === "monthly"
      ? [
        // ...oneTimePlans.filter((p) => p.name === "Starter Build Pack"),
        ...oneTimePlans.filter((p) => p.name === "Creator Build Pack"),
        ...monthlyPlans,
      ]
      : [
        // ...oneTimePlans.filter((p) => p.name === "Starter Build Pack"),
        ...oneTimePlans.filter((p) => p.name === "Creator Build Pack"),
        ...yearlyPlans,
        // ...oneTimePlans.filter((p) => p.name === "Super Plan"),
      ];
  const hasOffer = user?.offers ?? false;
  const isEduEmail = user?.email ? /@[\w.-]*\.edu(\.[\w]+)?$/i.test(user.email) : false;
  const hasEduOffer = hasOffer || isEduEmail;
  return (
    <Section id="pricing">
      {(credits?.credits ?? 0) > 1 && showMagicText && !hasEduOffer && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-stone-800 mb-1 flex items-center justify-center gap-2">
            Create Real Products, Faster Than Ever.
          </h2>
          <p className="text-base text-stone-600">
            Choose the right plan that unlocks your product-creation workflows -<br /> taking you from idea to factory-ready mode in minutes. No contracts, cancel anytime.
          </p>
        </div>
      )}

      {credits?.credits === 0 && !hasEduOffer && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
          <h2 className="text-xl font-semibold text-stone-800 mb-1 flex items-center justify-center gap-2">
            Keep The Magic Going
            <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-sm text-stone-600 ">
            You've reached the end of your free credits — upgrade to continue editing this product, create new ones,
            generate technical drawings, export factory-ready spec sheets, and unlock the full AI-native workflow with
            our Pro plan's features.
          </p>
        </div>
      )}

      {(hasOffer || isEduEmail) && (
        <div className="mb-6 p-4 bg-black  rounded-md text-center">
          <h3 className="text-lg font-semibold text-white mb-1">
            {isEduEmail ? "Student / Academic Discount Applied!" : "Offer Applied!"}
          </h3>
          <p className="text-white text-sm">
            {isEduEmail ? (
              "As a student or academic user with a .edu email, you get an automated <strong>25% extra free credits</strong> on the Pro Plan subscription!"
            ) : (
              <>
                Purchasing one of our plans will benefit you with <strong>25% extra free credits</strong> as you signed
                up through <strong>{user?.referred_by_user?.full_name}'s</strong> link!
              </>
            )}
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-transform ${billingPeriod === "monthly" ? "bg-white text-primary shadow-sm" : "text-[#1C1917]"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`flex items-center justify-center px-6 py-2 rounded-md text-sm font-medium transition-transform ${billingPeriod === "yearly" ? "bg-white text-primary shadow-sm" : "text-[#1C1917]"
              }`}
          >
            <span>Yearly</span>
            <span className="ml-2 px-2 py-0.5 bg-[#D2C8BC] text-black text-xs rounded-full">Save 25%</span>
          </button>
        </div>
      </div>
      {/* Main Pricing Plans */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {plansToShow.map((plan: any, index) => {
          const [selectedOption, setSelectedOption] = useState(
            plan.priceOptions ? plan.priceOptions.find((opt: any) => opt.price === plan.defaultPrice) : null
          );

          let displayPrice: string, displayPeriod: string | undefined, finalPrice: number | null;
          if (plan.isCustom) {
            displayPrice = "Contact Us";
            finalPrice = null;
          } else if (plan.isOneTime && plan.priceOptions) {
            displayPrice = `$${selectedOption?.price.toFixed(2)}`;
            displayPeriod = "one-time";
            finalPrice = selectedOption?.price;
          } else if (plan.isOneTime && plan.price) {
            displayPrice = `$${plan.price.toFixed(2)}`;
            displayPeriod = "one-time";
            finalPrice = plan.price;
          } else if (billingPeriod === "yearly") {
            displayPrice = `$${plan.monthlyPrice.toFixed(2)}`;
            displayPeriod = "/month, billed yearly";
            finalPrice = plan.yearlyPrice;
          } else {
            displayPrice = `$${plan.monthlyPrice.toFixed(2)}`;
            displayPeriod = "/month";
            finalPrice = plan.monthlyPrice;
          }
          const baseCreditsStr = selectedOption ? selectedOption.credits : plan.credits;
          const baseCredits = parseFloat(baseCreditsStr);
          const validBaseCredits = isNaN(baseCredits) ? 0 : baseCredits;
          const totalCredits = hasEduOffer ? Math.round(validBaseCredits * 1.25) : validBaseCredits;
          const unit = baseCreditsStr.includes("/month") ? "credits/month" : "credits";
          const creditsDisplay = hasEduOffer ? `${totalCredits} ${unit} (25% extra!)` : `${validBaseCredits} ${unit}`;
          const Icon = plan.icon?.component;
          console.log("🔍 ~ plansToShow.map() callback ~ components/paypal-card/page.tsx:181 ~ plan:", plan.priceOptions);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl p-4 sm:p-6 flex flex-col ${plan.popular
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary shadow-lg scale-105"
                : "bg-white border border-stone-200 hover:border-primary/20 hover:shadow-lg"
                }`}
            >
              {credits?.membership === plan?.membership && credits?.planType === billingPeriod ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-full shadow-md bg-[black]">
                    <Sparkles className="w-3 h-3 text-white" /> Your Plan
                  </span>
                </div>
              ) : (
                plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-full shadow-md bg-[black]">
                      <Sparkles className="w-3 h-3 text-white" /> Most Popular
                    </span>
                  </div>
                )
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">{Icon && <Icon {...plan.icon.props} />}</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{plan.name}</h3>

                {/* Select Dropdown for one-time plans */}
                {plan.priceOptions ? (
                  <div className="flex flex-col items-center space-y-2 pt-2 pb-4">
                    <Label htmlFor={`price-${plan.name}`}>Select Credits Package</Label>
                    <select
                      defaultValue={plan.defaultPrice.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = plan.priceOptions.find(
                          (opt: any) => opt.price.toString() === value
                        );
                        setSelectedOption(selected);
                      }}
                      className="w-28 h-8 text-sm px-2 py-1 mx-auto border border-gray-300 rounded-md"
                      id={`price-${plan.name}`}
                    >
                      <option value="" disabled>
                        Select your pack
                      </option>
                      {plan.priceOptions.map((opt: any) => (
                        <option key={opt.price} value={opt.price.toString()}>
                          ${opt.price.toFixed(2)}
                        </option>
                      ))}
                    </select>


                  </div>
                ) : (
                  <div className="mb-2 h-10">
                    <span className="text-2xl font-bold text-zinc-900">{displayPrice}</span>
                    {displayPeriod && <span className="text-zinc-600 ml-1 text-sm">{displayPeriod}</span>}
                  </div>
                )}

                {/* <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                  {selectedOption?.title || plan.title}
                </p> */}
                {/* Credits badge */}
                <div className="flex flex-col items-center mt-3 mb-4 text-center w-full">
                  <div className="flex flex-wrap justify-center gap-x-1 text-xs font-semibold text-stone-700">
                    <span>
                      {(selectedOption?.credits || plan.credits).replace(" (one-time)", "").replace(" (resets monthly)", "")}
                    </span>
                    <span className="text-stone-400">/</span>
                    <span>
                      {selectedOption ? selectedOption.products : (plan.products || "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-center mt-1">
                    <span className="text-sm font-bold text-primary">
                      {selectedOption?.costPerCredit || plan.costPerCredit} per credit
                    </span>
                    {(selectedOption?.saveLabel || plan.saveLabel) && (
                      <span className="text-[10px] font-bold text-white bg-black px-1.5 py-0.5 rounded-full">
                        {selectedOption?.saveLabel || plan.saveLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4 flex-grow">

                {plan.name.toLowerCase().includes("saver") && (
                  <p className="text-xs text-primary mb-2 font-semibold">
                    Saver features
                  </p>
                )}

                {plan.name.toLowerCase().includes("pro") && (
                  <p className="text-xs text-primary mb-2 font-semibold">
                    Unlock all Pro features
                  </p>
                )}
                {plan.name.toLowerCase().includes("team plan") && (
                  <p className="text-xs text-primary mb-2 font-semibold">
                    Unlock all Team Plan features
                  </p>
                )}
                <div className="space-y-1">
                  {(showAll ? plan.features : plan.features).map((feature: any, featureIndex: number) => {
                    // Handle both string format (old) and icon object format (new)
                    const isIconFormat = typeof feature === "object" && feature.icon && feature.text;
                    const FeatureIcon = isIconFormat ? feature.icon : null;
                    const featureText = isIconFormat ? feature.text : feature;

                    return (
                      <div key={featureIndex} className="flex items-start gap-2">
                        {FeatureIcon ? (
                          <FeatureIcon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-700 mt-0.5" />
                        ) : (
                          <div className="mt-1 h-1 w-1 rounded-full bg-[#1C1917] flex-shrink-0" />
                        )}
                        <span className="text-xs text-zinc-600">{featureText}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs font-medium text-zinc-700 mb-2 hidden sm:block mt-2">Scenario:</div>
                <p className="text-xs text-zinc-600 leading-relaxed mb-3 hidden sm:block">
                  {selectedOption?.scenario || plan.scenario}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-primary font-medium mb-4">
                <ArrowRight className="w-3 h-3" />
                <span>{plan.description}</span>
              </div>

              {(() => {
                // Check if this is the user's current plan
                const isCurrentPlan = credits?.membership === plan.membership &&
                  credits?.planType === billingPeriod &&
                  !plan.isOneTime;

                // Check if user has an active subscription (for showing upgrade option)
                const hasActiveSubscription = credits?.subscription_id &&
                  credits?.payment_provider === "polar" &&
                  !credits?.subscription_status_canceled;

                // Determine if this is a subscription plan (not one-time)
                const isSubscriptionPlan = !plan.isOneTime && !plan.isCustom;

                // Check if user can upgrade to this plan
                const canUpgrade = hasActiveSubscription &&
                  isSubscriptionPlan &&
                  !isCurrentPlan &&
                  credits?.planType === billingPeriod; // Same billing period

                // Determine button text
                let buttonText = plan.cta;
                if (isCurrentPlan) {
                  buttonText = "Your Active Plan";
                } else if (canUpgrade) {
                  // Determine if upgrade or downgrade based on plan hierarchy
                  const membershipOrder = { basic: 0, saver: 1, pro: 2, super: 3, team: 4 };
                  const currentOrder = membershipOrder[credits?.membership as keyof typeof membershipOrder] ?? 0;
                  const planOrder = membershipOrder[plan.membership as keyof typeof membershipOrder] ?? 0;
                  buttonText = planOrder > currentOrder ? "Upgrade" : "Downgrade";
                }

                const isUpgrading = upgradingPlan === plan.membership;

                return (
                  <Button
                    onClick={() => {
                      if (!user) {
                        setIsAuthModalOpen(true);
                        return;
                      }

                      if (isCurrentPlan) {
                        // Already on this plan, do nothing
                        return;
                      }

                      if (canUpgrade) {
                        // Show confirmation dialog before upgrade/downgrade
                        showUpgradeConfirmation({
                          membership: plan.membership,
                          planType: billingPeriod,
                          planName: plan.name,
                          newPrice: selectedOption ? selectedOption.price : finalPrice,
                          newCredits: selectedOption ? selectedOption.credits : plan.credits,
                        });
                      } else {
                        // Normal checkout flow
                        handleBuy({
                          price: selectedOption ? selectedOption.price : finalPrice,
                          description: `${plan.name} - ${creditsDisplay}`,
                          membership: plan.membership,
                          planType: plan.isOneTime ? "one_time" : billingPeriod,
                        });
                      }
                    }}
                    disabled={isCurrentPlan || isUpgrading}
                    className={`w-full rounded-xl text-sm font-medium mt-auto ${isCurrentPlan
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : plan.popular
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
                      }`}
                  >
                    {isUpgrading ? "Processing..." : buttonText}
                  </Button>
                );
              })()}
            </motion.div>
          );
        })}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Upgrade/Downgrade Confirmation Dialog */}
      <AlertDialog
        open={upgradeConfirmDialog?.isOpen ?? false}
        onOpenChange={(open) => !open && setUpgradeConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              {upgradeConfirmDialog?.isUpgrade ? "Confirm Upgrade" : "Confirm Downgrade"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-[#1C1917] space-y-3">
                <p>
                  You are about to {upgradeConfirmDialog?.isUpgrade ? "upgrade" : "downgrade"} to{" "}
                  <span className="font-semibold">{upgradeConfirmDialog?.planName}</span>.
                </p>

                <div className="bg-stone-50 p-3 rounded-lg border text-sm">
                  <p className="font-medium text-stone-900 mb-2">Plan Details:</p>
                  <ul className="space-y-1 text-stone-600">
                    <li>• {upgradeConfirmDialog?.newCredits} credits per {upgradeConfirmDialog?.planType === "monthly" ? "month" : "year"}</li>
                    <li>• ${upgradeConfirmDialog?.newPrice?.toFixed(2)}/{upgradeConfirmDialog?.planType === "monthly" ? "mo" : "yr"}</li>
                  </ul>
                </div>

                {upgradeConfirmDialog?.isUpgrade ? (
                  <p className="text-primary text-sm">
                    <strong>Note:</strong> You will be charged the prorated difference immediately using your saved payment method.
                  </p>
                ) : (
                  <p className="text-stone-600 text-sm">
                    <strong>Note:</strong> The price difference will be credited to your next billing cycle.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpgradeConfirmed}
              className={upgradeConfirmDialog?.isUpgrade ? "bg-primary" : "bg-stone-600"}
            >
              {upgradeConfirmDialog?.isUpgrade ? "Upgrade & Pay Now" : "Confirm Downgrade"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
};

export default PricingSection;
