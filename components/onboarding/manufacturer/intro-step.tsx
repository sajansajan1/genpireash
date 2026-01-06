"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Factory, Zap, Users, DollarSign, CalendarCheck, Sparkles, Target } from "lucide-react";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface IntroStepProps {
  onNext: () => void;
}

export function IntroStep({ onNext }: IntroStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-4 `}>Welcome to Genpire's Supplier Network</h2>
        <p className="text-[#1C1917] max-w-2xl mx-auto">
          Genpire connects verified manufacturers to product creators across the globe. When a creator generates a
          product idea and spec sheet, Genpire instantly matches it to you based on your materials, product category,
          and capacity.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-5 w-5 text-zinc-900" />
            </div>
            <h3 className={`text-lg font-semibold `}>Perfect Matches</h3>
          </div>
          <p className="text-sm text-[#1C1917]">
            Get matched to projects that fit your exact production type, materials, and capacity. No more wasted time on
            unsuitable inquiries.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Factory className="h-5 w-5 text-zinc-900" />
            </div>
            <h3 className={`text-lg font-semibold `}>Direct Quoting</h3>
          </div>
          <p className="text-sm text-[#1C1917]">
            Quote directly on detailed spec sheets with your MOQ, sample cost, and lead time. Creators see your quotes
            instantly.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-zinc-900" />
            </div>
            <h3 className={`text-lg font-semibold `}>Build Relationships</h3>
          </div>
          <p className="text-sm text-[#1C1917]">
            Chat with creators and build lasting B2B relationships. Many Genpire creators become repeat customers.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 border border-muted">
        <h3 className={`text-xl font-semibold mb-4 `}>Pricing</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CalendarCheck className="h-5 w-5  mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Fixed Annual Listing Fee</p>
              <p className="text-sm text-[#1C1917]">
                Genpire operates on a fixed annual listing fee and low commission per confirmed sample — similar to
                Alibaba.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5  mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Early Partner Discount</p>
              <p className="text-sm text-[#1C1917]">
                Early partners can join at <strong>no cost for the first 3 months</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5  mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Pay Only for Success</p>
              <p className="text-sm text-[#1C1917]">
                No commission until you're matched successfully with a creator who orders samples.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onNext}>
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
