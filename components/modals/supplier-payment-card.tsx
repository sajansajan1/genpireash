"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Eye, PiggyBank, Crown, Users, Sparkles, ArrowRight, PartyPopper, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming a Shadcn UI button
import { AuthModal } from "../auth/auth-modal";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "../ui/select";
import { Label } from "../ui/label";
import {
  oneTimePlans,
  monthlyPlans,
  yearlyPlans,
  SupplierMonthlyPlans,
  SupplierYearlyPlans,
} from "@/lib/utils/payments";
import { useSearchParams } from "next/navigation";

const Section = ({ id, eyebrow, title, subtitle, children }: any) => {
  return (
    <section id={id} className="relative w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-background">
      <div className="mx-auto max-w-7xl">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center"
          >
            <span
              className="inline-block px-4 py-2 text-sm font-medium text-black border border-stone-300 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: "#D2C8BC" }}
            >
              {eyebrow}
            </span>
          </motion.div>
        )}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl tracking-tight text-stone-900 sm:text-3xl lg:text-4xl mb-6 font-semibold">
              {title}
            </h2>
            {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};

export const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useUserStore();
  const searchParams = useSearchParams();
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  const isLoading = false; // Provider handles loading state
  const [showAll, setShowAll] = useState(false);
  const [showMagicText, setShowMagicText] = useState<boolean>(false);
  useEffect(() => {
    if (!credits) {
      refresCreatorCredits();
    }
  }, [credits, refresCreatorCredits]);

  useEffect(() => {
    const version = searchParams?.get("version");
    if (version === "modular") {
      setShowMagicText(true);
    }
  }, [searchParams]);

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
    // const { canBuy, membershipStatus } = getCreatorCredits;
    // const isOneTime = planType === "one_time";

    if (price === null) {
      window.location.assign("mailto:support@genpire.com");
      return;
    }

    const params = new URLSearchParams({
      price: price.toString(),
      des: description,
      membership,
      plan_type: planType,
      offer: (user?.offers ?? false).toString(),
    });

    window.location.assign(`/paypal?${params.toString()}`);
  };

  const plansToShow =
    billingPeriod === "monthly"
      ? [
          //   ...oneTimePlans.filter((p) => p.name === "Pay-As-You-Go Credits"),
          ...SupplierMonthlyPlans,
          //   ...oneTimePlans.filter((p) => p.name === "Team Plan"),
        ]
      : [
          //   ...oneTimePlans.filter((p) => p.name === "Pay-As-You-Go Credits"),
          ...SupplierYearlyPlans,
          //   ...oneTimePlans.filter((p) => p.name === "Team Plan"),
        ];
  const hasOffer = user?.offers ?? false;
  return (
    <Section id="pricing">
      {credits?.credits === 0 && !hasOffer && showMagicText && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
          <h2 className="text-xl font-semibold text-stone-800 mb-1 flex items-center justify-center gap-2">
            Keep The Magic Going <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-sm text-stone-600 ">
            You've reached the end of your free credits — upgrade to continue editing this product, create new ones,
            generate technical drawings, export factory-ready spec sheets, and unlock the full AI-native workflow with
            our Pro plan's features.
          </p>
        </div>
      )}

      {hasOffer && (
        <div className="mb-6 p-4 bg-black rounded-md text-center">
          <h3 className="text-lg font-semibold text-white mb-1">Offer Applied!</h3>
          <p className="text-white text-sm">
            Purchasing one of our plans will benefit you with <strong>25% extra free credits</strong> as you signed up
            through <strong>{user?.referred_by_user?.full_name}'s</strong> link!
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-transform ${
              billingPeriod === "monthly" ? "bg-white text-primary shadow-sm" : "text-[#1C1917]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`flex items-center justify-center px-6 py-2 rounded-md text-sm font-medium transition-transform ${
              billingPeriod === "yearly" ? "bg-white text-primary shadow-sm" : "text-[#1C1917]"
            }`}
          >
            <span>Yearly</span>
            <span className="ml-2 px-2 py-0.5 bg-[#D2C8BC] text-black text-xs rounded-full">Save 20%</span>
          </button>
        </div>
      </div>
      {/* Main Pricing Plans */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {plansToShow.map((plan: any, index) => {
          const [selectedOption, setSelectedOption] = useState(
            plan.priceOptions ? plan.priceOptions.find((opt: any) => opt.price === plan.defaultPrice) : null
          );

          let displayPrice, displayPeriod, finalPrice;
          if (plan.isCustom) {
            displayPrice = "Contact Us";
            finalPrice = null;
          } else if (plan.isOneTime && plan.priceOptions) {
            displayPrice = `$${selectedOption?.price.toFixed(2)}`;
            displayPeriod = "one-time";
            finalPrice = selectedOption?.price;
          } else if (billingPeriod === "yearly") {
            displayPrice = `$${plan.monthlyPrice.toFixed(2)}`;

            // If Starter Plan → force it to show monthly instead of yearly
            if (plan.name === "Starter Plan") {
              displayPeriod = "/month";
              finalPrice = plan.monthlyPrice; // do NOT use yearlyPrice
            } else {
              displayPeriod = "/billed yearly";
              finalPrice = plan.yearlyPrice;
            }
          } else {
            displayPrice = `$${plan.monthlyPrice.toFixed(2)}`;
            displayPeriod = "/month";
            finalPrice = plan.monthlyPrice;
          }
          const baseCreditsStr = selectedOption?.credits ?? plan?.credits ?? "";

          const unit = baseCreditsStr.includes("/month") ? "credits/month" : "credits";

          const baseCredits = parseFloat(baseCreditsStr);
          const validBaseCredits = isNaN(baseCredits) ? 0 : baseCredits;
          const totalCredits = hasOffer ? Math.round(validBaseCredits * 1.25) : validBaseCredits;
          //   const unit = baseCreditsStr.includes("/month") ? "credits/month" : "credits";
          const creditsDisplay = hasOffer ? `${totalCredits} ${unit} (20% extra!)` : `${validBaseCredits} ${unit}`;
          const Icon = plan.icon?.component;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl p-4 sm:p-6 flex flex-col ${
                plan.popular
                  ? "bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary shadow-lg scale-105"
                  : "bg-white border border-stone-200 hover:border-primary/20 hover:shadow-lg"
              }`}
            >
              {credits?.membership === plan?.membership && credits?.planType === billingPeriod ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-black rounded-full shadow-md bg-[#D2C8BC]">
                    <Sparkles className="w-3 h-3 text-black" /> Your Plan
                  </span>
                </div>
              ) : (
                plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-black rounded-full shadow-md bg-[#D2C8BC]">
                      <Sparkles className="w-3 h-3 text-black" /> Most Popular
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
                    <Select
                      defaultValue={plan.defaultPrice.toString()}
                      onValueChange={(value) => {
                        const selected = plan.priceOptions.find((opt: any) => opt.price.toString() === value);
                        setSelectedOption(selected);
                      }}
                    >
                      <SelectTrigger id={`price-${plan.name}`} className="w-28 h-8 text-sm px-2 py-1 mx-auto">
                        <SelectValue placeholder="Select your pack" />
                      </SelectTrigger>
                      <SelectContent>
                        {plan.priceOptions.map((opt: any) => (
                          <SelectItem key={opt.price} value={opt.price.toString()}>
                            ${opt.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="mb-2 h-10">
                    <span className="text-2xl font-bold text-zinc-900">{displayPrice}</span>
                    {displayPeriod && <span className="text-zinc-600 ml-1 text-sm">{displayPeriod}</span>}
                  </div>
                )}

                {/* Credits badge */}
                {/* <div
                  className="inline-block px-3 py-1 rounded-full border mb-3 mt-2"
                  style={{ backgroundColor: "#D2C8BC", borderColor: "#D2C8BC" }}
                >
                  <span className="text-xs font-semibold text-black">
                    {selectedOption ? selectedOption.credits : plan.credits}
                  </span>
                </div> */}
              </div>

              <div className="mb-4 flex-grow">
                {/* <div className="text-xs font-medium text-zinc-700 mb-2 hidden sm:block">Scenario:</div> */}
                <p className="text-xs text-zinc-600 leading-relaxed mb-3 hidden sm:block">
                  {selectedOption?.scenario || plan.scenario}
                </p>

                <div className="text-xs font-medium text-zinc-700 mb-2">Features:</div>
                <div className="space-y-1">
                  {(showAll ? plan.features : plan.features.slice(0, 3)).map((feature: any, featureIndex: number) => {
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

                  {!showAll && plan.features.length > 3 && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="text-xs text-zinc-500 italic hover:underline focus:outline-none"
                    >
                      +{plan.features.length - 3} more...
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-primary font-medium mb-4">
                <ArrowRight className="w-3 h-3" />
                <span>{plan.description}</span>
              </div>

              <Button
                onClick={() => (user ? "" : setIsAuthModalOpen(true))}
                className={`w-full rounded-xl text-sm font-medium mt-auto ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
                }`}
              >
                {credits?.membership === plan.membership && credits?.planType == billingPeriod
                  ? "Your Active Plan"
                  : plan.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Section>
  );
};

export default PricingSection;
