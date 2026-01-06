import {
  Zap,
  Star,
  Building,
  Eye,
  PiggyBank,
  Crown,
  Users,
  Sparkles,
  Ticket,
  Wrench,
  Ruler,
  FileUp,
  X as XIcon,
  Image,
  Paintbrush,
  Package2,
  Dna,
  Glasses,
  Bell,
  Building2,
  Megaphone,
  Rocket,
  BarChart3,
  MessageSquare,
  LayoutDashboard,
  Headphones,
  Heart,
  Baby,
  BookOpen,
  CrownIcon,
} from "lucide-react";
export const packages = [
  {
    id: "curious",
    title: "Curious",
    icon: { component: Eye, props: { className: "h-5 w-5 text-green-500 mr-2" } },
    price: 9.99,
    credits: 15,
    costPerCredit: "$0.67",
    description: "Curious Package - 15 Tech Pack Credits",
    features: ["AI-Powered Generation", "PDF Export", "RFQ Management", "Supplier Matching"],
  },
  {
    id: "starter",
    title: "Starter",
    icon: { component: Zap, props: { className: "h-5 w-5 text-blue-500 mr-2" } },
    price: 29,
    credits: 50,
    costPerCredit: "$0.58",
    description: "Starter Package - 50 Tech Pack Credits",
    features: ["AI-Powered Generation", "PDF Export", "RFQ Management", "Supplier Matching", "Basic Support"],
  },
  {
    id: "professional",
    title: "Professional",
    icon: { component: Star, props: { className: "h-5 w-5 text-yellow-500 mr-2" } },
    price: 79,
    credits: 150,
    costPerCredit: "$0.53 per tech pack (6% savings)",
    description: "Professional Package - 150 Tech Pack Credits",
    features: ["All Starter features", "Priority Support", "Advanced Templates", "Enhanced Analytics"],
    bestValue: true,
  },
  {
    id: "enterprise",
    title: "Enterprise",
    icon: { component: Building, props: { className: "h-5 w-5 text-purple-500 mr-2" } },
    price: 199,
    credits: 500,
    costPerCredit: "$0.40 per tech pack (20% savings)",
    description: "Enterprise Package - 500 Tech Pack Credits",
    features: ["All Professional features", "24/7 Priority Support", "Custom Branding", "Dedicated Account Manager"],
  },
];

// Restructured plan data for clarity
// Restructured plan data for clarity
export const monthlyPlans = [
  // {
  //   name: "Saver Plan",
  //   monthlyPrice: 19.9,
  //   credits: "75 credits/month",
  //   description: "Best for testing multiple ideas",
  //   title: "Your entry point to fast AI-powered product design & creation. Built for anyone who looks to design & produce real products at the speed of AI. No previous skills required.",
  //   products: "15–25 Products/Month",
  //   scenario:
  //     "Generate and edit with AI 15–25 factory-ready products per month, generate and edit 15-25  fully specified tech packs, plus unlimited manual edits",
  //   features: [
  //     { icon: Ticket, text: "75 credits every month (resets monthly)" },
  //     { icon: Wrench, text: "AI Product Generation" },
  //     { icon: Ruler, text: "AI Tech Files Generation" },
  //     { icon: FileUp, text: "Export to PDF & Excel" },
  //     { icon: XIcon, text: "No Pro features (Brand DNA, Collections, Try-On)" },
  //   ],
  //   cta: "Start Saver Plan",
  //   popular: false,
  //   isOneTime: false,
  //   icon: { component: Heart, props: { className: "w-5 h-5 text-black" } },
  //   membership: "saver",
  //   costPerCredit: "$0.26",
  //   saveLabel: null,
  // },
  {
    name: "Pro Plan",
    monthlyPrice: 39.9,
    credits: "200 credits/month",
    products: "30–50 Products/Month",
    description: "Perfect for designers, startups, and small brands",
    title: "Your full-access to our AI-powered Product Studio - from ideation, to design and factory-ready files in minutes. Built for makers, designers, brands and experts alike.",
    scenario:
      "Generate and edit with AI 30–50 factory-ready products per month, generate and edit 30-50 fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Ticket, text: "200 credits monthly (resets on the 1st)" },
      { icon: Dna, text: "Connect Your Brand DNA" },
      { icon: Image, text: "AI Visuals & Tech Packs" },
      { icon: Paintbrush, text: "AI Editor (full access)" },
      { icon: Package2, text: "Collection Generation" },
      { icon: Image, text: "Export to SVG" },
      { icon: Wrench, text: "Unlimited manual edits" },
      { icon: FileUp, text: "Export to PDF & Excel" },
      { icon: Glasses, text: "Virtual Try-On Studio" },
    ],
    cta: "Start Pro Plan",
    popular: true,
    isOneTime: false,
    icon: { component: Crown, props: { className: "w-5 h-5 text-black" } },
    membership: "pro",
    costPerCredit: "$0.20",
    saveLabel: null,
  },
  {
    name: "Super Plan",
    monthlyPrice: 99.9,
    credits: "650 credits/month",
    products: "60-90 Products/Month",
    description: "Ideal for designers and teams",
    title: "Your full-access to our AI-powered Product Studio - from ideation, to design and factory-ready files in minutes. Built for makers, designers, brands and experts alike.",
    scenario:
      "Generate and edit with AI 60-90 factory-ready products per month, generate and edit 60-90  fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Ticket, text: "650 credits monthly (resets on the 1st)" },
      { icon: Dna, text: "Connect Your Brand DNA" },
      { icon: Image, text: "AI Visuals & Tech Packs" },
      { icon: Paintbrush, text: "AI Editor (full access)" },
      { icon: Image, text: "Export to SVG" },
      { icon: Package2, text: "Collection Generation" },
      { icon: Wrench, text: "Unlimited manual edits" },
      { icon: FileUp, text: "Export to PDF & Excel" },
      { icon: Glasses, text: "Virtual Try-On Studio" },
    ],
    cta: "Start Super Plan",
    popular: false,
    icon: { component: Heart, props: { className: "w-5 h-5 text-black" } },
    membership: "super",
    costPerCredit: "$0.15",
    saveLabel: null,
  },
];

export const yearlyPlans = [
  // {
  //   name: "Saver Plan",
  //   monthlyPrice: 14.9, // This is $286 / 12
  //   yearlyPrice: 178,
  //   originalMonthlyPrice: 14.9,
  //   discounted: "Total $178/year, save 25%",
  //   credits: "75 credits/month",
  //   products: "15–25 Products/Month",
  //   description: "Best for testing multiple ideas",
  //   title: "Your entry point to fast AI-powered product design & creation. Built for anyone who looks to design & produce real products at the speed of AI. No previous skills required.",
  //   scenario:
  //     "Generate and edit with AI 15–25 factory-ready products per month, generate and edit 15-25  fully specified tech packs, plus unlimited manual edits",
  //   features: [
  //     { icon: Ticket, text: "75 credits every month (resets monthly)" },
  //     { icon: Wrench, text: "AI Product Generation" },
  //     { icon: Ruler, text: "AI Tech Files Generation" },
  //     { icon: FileUp, text: "Export to PDF & Excel" },
  //     { icon: XIcon, text: "No Pro features (Brand DNA, Collections, Try-On)" },
  //   ],
  //   cta: "Start Saver Plan",
  //   popular: false,
  //   icon: { component: Heart, props: { className: "w-5 h-5 text-black" } },
  //   membership: "saver",
  //   costPerCredit: "$0.19",
  //   saveLabel: "Save 27% vs Monthly",
  // },
  {
    name: "Pro Plan",
    monthlyPrice: 29.9, // This is $470 / 12
    yearlyPrice: 358,
    originalMonthlyPrice: 29.9,
    discounted: "Total $358/year, save 25%",
    credits: "200 credits/month",
    products: "30–50 Products/Month",
    description: "Perfect for designers, startups, and small brands",
    title: "Your full-access to our AI-powered Product Studio - from ideation, to design and factory-ready files in minutes. Built for makers, designers, brands and experts alike.",
    scenario:
      "Generate and edit with AI 30–50 factory-ready products per month, generate and edit 30-50 fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Ticket, text: "200 credits monthly (resets on the 1st)" },
      { icon: Dna, text: "Connect Your Brand DNA" },
      { icon: Image, text: "AI Visuals & Tech Packs" },
      { icon: Paintbrush, text: "AI Editor (full access)" },
      { icon: Image, text: "Export to SVG" },
      { icon: Package2, text: "Collection Generation" },
      { icon: Wrench, text: "Unlimited manual edits" },
      { icon: FileUp, text: "Export to PDF & Excel" },
      { icon: Glasses, text: "Virtual Try-On Studio" },
    ],
    cta: "Start Pro Plan",
    popular: true,
    icon: { component: Crown, props: { className: "w-5 h-5 text-black" } },
    membership: "pro",
    costPerCredit: "$0.15",
    saveLabel: "Save 27% vs Monthly",
  },
  {
    name: "Super Plan",
    monthlyPrice: 75, // This is $286 / 12
    yearlyPrice: 899,
    originalMonthlyPrice: 75,
    discounted: "Total $899/year, save 25%",
    credits: "650 credits/month",
    products: "60-90 Products/Month",
    description: "Ideal for designers and teams & Save 25% with yearly billing",
    title: "Your full-access to our AI-powered Product Studio - from ideation, to design and factory-ready files in minutes. Built for makers, designers, brands and experts alike.",
    scenario:
      "Generate and edit with AI 60-90 factory-ready products per month, generate and edit 60-90  fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Ticket, text: "650 credits monthly (resets on the 1st)" },
      { icon: Dna, text: "Connect Your Brand DNA" },
      { icon: Image, text: "AI Visuals & Tech Packs" },
      { icon: Paintbrush, text: "AI Editor (full access)" },
      { icon: Image, text: "Export to SVG" },
      { icon: Package2, text: "Collection Generation" },
      { icon: Wrench, text: "Unlimited manual edits" },
      { icon: FileUp, text: "Export to PDF & Excel" },
      { icon: Glasses, text: "Virtual Try-On Studio" },
    ],
    cta: "Start Super Plan",
    popular: false,
    icon: { component: Heart, props: { className: "w-5 h-5 text-black" } },
    membership: "super",
    costPerCredit: "$0.12",
    saveLabel: null,
  },
];

export const oneTimePlans = [
  {
    name: "Creator Build Pack",
    priceOptions: [
      { price: 14.90, credits: "30 credits", products: "3-4 Products", scenario: "Generate up to 3-4 factory ready products", costPerCredit: "$0.46", saveLabel: "Save 23%" },
      { price: 29.90, credits: "65 credits", products: "6-8 Products", scenario: "Generate up to 6-8 factory ready products", costPerCredit: "$0.46", saveLabel: "Save 23%" },
      { price: 49.90, credits: "120 credits", products: "30–40 Products", scenario: "Generate up to 30-40 factory ready products", costPerCredit: "$0.41", saveLabel: "Save 31%" },
      { price: 69.90, credits: "200 credits", products: "50-60 Products", scenario: "Generate up to 50-60 factory ready products", costPerCredit: "$0.35", saveLabel: "Save 42%" },
    ],
    defaultPrice: 14.90,
    credits: "30 credits (one-time)",
    description:
      "Perfect for creators who want Genpire access without a monthly plan — buy credits once, use them anytime.",
    features: [
      { icon: Sparkles, text: "All-Access to Genpire's AI Product Editor" },
      { icon: Ticket, text: "One-time credits (no refill)" },
      { icon: Wrench, text: "AI Product Generation" },
      { icon: Ruler, text: "AI Technical Files Generation" },
      { icon: FileUp, text: "Export to PDF & Excel" },
    ],
    cta: "Buy Credits",
    popular: false,
    isOneTime: true,
    icon: { component: Eye, props: { className: "w-5 h-5 text-black" } },
    membership: "add_on",
  },
  // {
  //   name: "Starter Build Pack",
  //   price: 11.90,
  //   credits: "20 credits (one-time)",
  //   description:
  //     "Perfect for creators who want Genpire access without a monthly plan — buy credits once, use them anytime.",
  //   features: [
  //     { icon: Sparkles, text: "All-Access to Genpire's AI Product Editor" },
  //     { icon: Ticket, text: "One-time credits (no refill)" },
  //     { icon: Wrench, text: "AI Product Generation" },
  //     { icon: Ruler, text: "AI Technical Files Generation" },
  //     { icon: FileUp, text: "Export to PDF & Excel" },
  //   ],
  //   products: "2-3 Products",
  //   scenario: "Generate up to 2-3 factory ready products",
  //   cta: "Buy Credits",
  //   popular: false,
  //   isOneTime: true,
  //   icon: { component: BookOpen, props: { className: "w-5 h-5 text-black" } },
  //   membership: "add_on",
  //   costPerCredit: "$0.60",
  //   saveLabel: null,
  // },
  // {
  //   name: "Team Plan",
  //   price: null,
  //   credits: "Custom credits",
  //   description: "Everything in Pro + team collaboration, onboarding support",
  //   scenario: "Requires company/contact details for follow-up",
  //   title: "Your full AI product studio for teams — collaborate, design, and produce at scale with shared tools, workflows, and supplier integrations. Built for growing brands and product teams.",
  //   features: [
  //     { icon: Ticket, text: "Custom credits package" },
  //     { icon: Sparkles, text: "Everything in Pro" },
  //     { icon: Building2, text: "Supplier Integration & RFQ flows" },
  //     { icon: Users, text: "Team collaboration (multi-user access)" },
  //     { icon: Bell, text: "Advanced support & onboarding" },
  //   ],
  //   cta: "Contact Sales",
  //   popular: false,
  //   isOneTime: false,
  //   isCustom: true,
  //   icon: { component: Users, props: { className: "w-5 h-5 text-black" } },
  //   membership: "team",
  // },
];

export const SupplierMonthlyPlans = [
  {
    name: "Starter Plan",
    monthlyPrice: 49.99,
    // credits: "75 credits/month",
    description: "🎯For small suppliers who want visibility but aren’t ready for big commitments",
    // scenario:"🎯For small suppliers who want visibility but aren’t ready for big commitments",
    features: [
      {
        icon: Building2,
        text: "Basic company profile listed in Genpire supplier directory",
      },
      { icon: Eye, text: "Appear in up to 2 customer searches per month" },
      {
        icon: Eye,
        text: "Limited access to customer requests (view-only, can’t message)",
      },
      {
        icon: Bell,
        text: "Email alerts when new matching projects are available",
      },
      { icon: Sparkles, text: "Community updates & supplier newsletter" },
    ],
    cta: "Start Saver Plan",
    popular: false,
    isOneTime: false,
    icon: { component: PiggyBank, props: { className: "w-5 h-5 text-black" } },
    membership: "saver",
  },
  {
    name: "Basic Plan",
    monthlyPrice: 99.99,
    // credits: "75 credits/month",
    description: "🎯For active suppliers who want to receive and engage with real leads",
    // scenario:
    //   "Generate and edit with AI 15–25 factory-ready products per month, generate and edit 15-25  fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Crown, text: "Everything in Starter, plus:" },
      { icon: Eye, text: "Appear in up to 20 customer searches/month" },
      { icon: MessageSquare, text: "Direct messaging with brands & designers" },
      { icon: LayoutDashboard, text: "Dedicated Supplier dashboard" },
      { icon: Headphones, text: "Dedicated 1 business-day support" },
      {
        icon: Sparkles,
        text: "Priority placement in search results (above Starter)",
      },
    ],

    cta: "Start Saver Plan",
    popular: false,
    isOneTime: false,
    icon: { component: Eye, props: { className: "w-5 h-5 text-black" } },
    membership: "basic",
  },
  {
    name: "Pro Plan",
    monthlyPrice: 299.9,
    credits: "200 credits/month",
    description: "🎯For growth-focused suppliers who want maximum visibility & premium benefits",
    // scenario:
    //   "Generate and edit with AI 30–50 factory-ready products per month, generate and edit 15-25 fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Crown, text: "Everything in Basic, plus:" },
      { icon: Sparkles, text: "Unlimited matches with customer tech packs" },
      {
        icon: Star,
        text: "Featured supplier status (top-tier visibility in matches)",
      },
      {
        icon: Building2,
        text: "Access to high-value enterprise leads (larger brands)",
      },
      { icon: Rocket, text: "Early access to new platform features" },
      { icon: BarChart3, text: "Premium analytics" },
      {
        icon: Users,
        text: "Dedicated Genpire account manager (priority support, onboarding help)",
      },
      {
        icon: Megaphone,
        text: "Highlighted in Genpire marketing (newsletters, spotlights, case studies)",
      },
    ],

    cta: "Start Pro Plan",
    popular: true,
    isOneTime: false,
    icon: { component: Crown, props: { className: "w-5 h-5 text-black" } },
    membership: "pro",
  },
];

export const SupplierYearlyPlans = [
  {
    name: "Starter Plan",
    monthlyPrice: 49.99,
    credits: "75 credits/month",
    description: "🎯For small suppliers who want visibility but aren't ready for big commitments",
    // scenario:"🎯For small suppliers who want visibility but aren't ready for big commitments",
    features: [
      {
        icon: Building2,
        text: "Basic company profile listed in Genpire supplier directory",
      },
      { icon: Eye, text: "Appear in up to 2 customer searches per month" },
      {
        icon: Eye,
        text: "Limited access to customer requests (view-only, can't message)",
      },
      {
        icon: Bell,
        text: "Email alerts when new matching projects are available",
      },
      { icon: Sparkles, text: "Community updates & supplier newsletter" },
    ],
    cta: "Start Saver Plan",
    popular: false,
    isOneTime: false,
    icon: { component: PiggyBank, props: { className: "w-5 h-5 text-black" } },
    membership: "saver",
  },
  {
    name: "Basic Plan",
    monthlyPrice: 999,
    credits: "75 credits/month",
    description: "🎯For active suppliers who want to receive and engage with real leads",
    // scenario:
    //   "Generate and edit with AI 15–25 factory-ready products per month, generate and edit 15-25  fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Crown, text: "Everything in Starter, plus:" },
      { icon: Eye, text: "Appear in up to 20 customer searches/month" },
      { icon: MessageSquare, text: "Direct messaging with brands & designers" },
      { icon: LayoutDashboard, text: "Dedicated Supplier dashboard" },
      { icon: Headphones, text: "Dedicated 1 business-day support" },
      {
        icon: Sparkles,
        text: "Priority placement in search results (above Starter)",
      },
    ],

    cta: "Start Saver Plan",
    popular: false,
    isOneTime: false,
    icon: { component: Eye, props: { className: "w-5 h-5 text-black" } },
    membership: "basic",
  },
  {
    name: "Pro Plan",
    monthlyPrice: 3000,
    credits: "200 credits/month",
    description: "🎯For growth-focused suppliers who want maximum visibility & premium benefits",
    // scenario:
    //   "Generate and edit with AI 30–50 factory-ready products per month, generate and edit 15-25 fully specified tech packs, plus unlimited manual edits",
    features: [
      { icon: Crown, text: "Everything in Basic, plus:" },
      { icon: Sparkles, text: "Unlimited matches with customer tech packs" },
      {
        icon: Star,
        text: "Featured supplier status (top-tier visibility in matches)",
      },
      {
        icon: Building2,
        text: "Access to high-value enterprise leads (larger brands)",
      },
      { icon: Rocket, text: "Early access to new platform features" },
      { icon: BarChart3, text: "Premium analytics" },
      {
        icon: Users,
        text: "Dedicated Genpire account manager (priority support, onboarding help)",
      },
      {
        icon: Megaphone,
        text: "Highlighted in Genpire marketing (newsletters, spotlights, case studies)",
      },
    ],

    cta: "Start Pro Plan",
    popular: true,
    isOneTime: false,
    icon: { component: Crown, props: { className: "w-5 h-5 text-black" } },
    membership: "pro",
  },
];

/**
 * Payment Provider Configuration
 *
 * Set this to "polar" to use Polar.sh or "paypal" to use PayPal.
 * Can be overridden via NEXT_PUBLIC_PAYMENT_PROVIDER environment variable.
 */
export const PAYMENT_PROVIDER: "polar" | "paypal" =
  (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as "polar" | "paypal") || "polar";

/**
 * Check if Polar is the active payment provider
 */
export function isPolarEnabled(): boolean {
  return PAYMENT_PROVIDER === "polar";
}

/**
 * Generate checkout URL based on payment provider
 */
export function getCheckoutUrl({
  price,
  description,
  membership,
  planType,
  userId,
  userEmail,
  hasOffer,
  polarProductId,
}: {
  price: number;
  description: string;
  membership: string;
  planType: string;
  userId?: string;
  userEmail?: string;
  hasOffer?: boolean;
  polarProductId?: string;
}): string {
  if (PAYMENT_PROVIDER === "polar" && polarProductId) {
    // Polar checkout URL - SDK expects 'products' parameter
    const params = new URLSearchParams({
      products: polarProductId,
    });

    if (userId) {
      params.set("customerExternalId", userId);
    }
    if (userEmail) {
      params.set("customerEmail", userEmail);
    }

    // Pass metadata for webhook handling
    const metadata = JSON.stringify({
      userId,
      hasOffer: hasOffer ? "true" : "false",
      membership,
      planType,
    });
    params.set("metadata", metadata);

    return `/api/polar/checkout?${params.toString()}`;
  }

  // PayPal checkout URL (existing logic)
  const params = new URLSearchParams({
    price: price.toString(),
    des: description,
    membership,
    plan_type: planType,
    offer: (hasOffer ?? false).toString(),
  });

  return `/paypal?${params.toString()}`;
}
