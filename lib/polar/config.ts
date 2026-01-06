/**
 * Polar.sh Configuration
 *
 * This file contains all Polar product mappings and configuration.
 * Update POLAR_PRODUCTS with actual product IDs from your Polar dashboard.
 */

export type PolarProductType = "subscription" | "one_time";
export type PolarPlanType = "monthly" | "yearly" | "one_time";
export type PolarMembership =
  | "saver"
  | "pro"
  | "super"
  | "team"
  | "add_on"
  | "basic";

export interface PolarProduct {
  id: string; // Polar product ID - get from dashboard
  name: string;
  price: number;
  credits: number;
  type: PolarProductType;
  planType: PolarPlanType;
  membership: PolarMembership;
  description: string;
}

/**
 * IMPORTANT: Replace these placeholder IDs with actual Polar product IDs
 * from your Polar dashboard after creating products there.
 *
 * To create products:
 * 1. Go to https://polar.sh/dashboard
 * 2. Navigate to Products
 * 3. Create each product with matching prices
 * 4. Copy the product ID and paste here
 */
export const POLAR_PRODUCTS: Record<string, PolarProduct> = {
  // Monthly Subscriptions
  saver_monthly: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "b7cc08d1-e0a2-45ce-99b3-4fbd4e0a87bf"
        : "47cfb7c1-8bd2-448a-8ab5-b5305886309e", // Replace with actual ID
    name: "Saver Plan",
    price: 19.9,
    credits: 75,
    type: "subscription",
    planType: "monthly",
    membership: "saver",
    description: "75 credits/month - Best for testing multiple ideas",
  },
  pro_monthly: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "3501a064-d5bc-43a4-917b-2386ab6a53b8"
        : "70d8fc9e-c6d5-4f0b-9ee4-eeb9b20e2705", // Replace with actual ID
    name: "Pro Plan",
    price: 39.9,
    credits: 200,
    type: "subscription",
    planType: "monthly",
    membership: "pro",
    description: "200 credits/month - Perfect for designers and startups",
  },
  super_monthly: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? ""
        : "41144f26-4157-4759-a1d8-cec439cec2cd", // Replace with actual ID
    name: "Super Plan",
    price: 99.9,
    credits: 650,
    type: "subscription",
    planType: "monthly",
    membership: "super",
    description: "650 credits/month - Perfect for designers and startups",
  },

  // Yearly Subscriptions
  saver_yearly: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "2dbe49d6-55d3-46bf-8ec3-9e6e58e2a0e6"
        : "7320f436-3c5b-405b-aee5-a4219fc274e7", // Replace with actual ID
    name: "Saver Plan (Yearly)",
    price: 178,
    credits: 75, // per month
    type: "subscription",
    planType: "yearly",
    membership: "saver",
    description: "75 credits/month - Save 25% with yearly billing",
  },
  pro_yearly: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "42dd0dbf-646d-42a9-b9d4-2ee4f16ceb22"
        : "6cf57730-a2d9-4b19-b460-751c3918a647", // Replace with actual ID
    name: "Pro Plan (Yearly)",
    price: 358,
    credits: 200, // per month
    type: "subscription",
    planType: "yearly",
    membership: "pro",
    description: "200 credits/month - Save 25% with yearly billing",
  },
  super_yearly: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? ""
        : "649b8aac-2e80-4519-b86f-3fda352ac171", // Replace with actual ID
    name: "Super Plan (Yearly)",
    price: 899,
    credits: 650, // per month
    type: "subscription",
    planType: "yearly",
    membership: "super",
    description: "650 credits/month - Save 25% with yearly billing",
  },

  // One-time Credit Packages
  credits_30: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "5c515e41-85fa-426d-b666-d3f11142e3ce"
        : "", // Replace with actual ID
    name: "30 Credits",
    price: 14.9,
    credits: 30,
    type: "one_time",
    planType: "one_time",
    membership: "add_on",
    description: "One-time purchase - 30 credits",
  },
  credits_60: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "a3b1c383-0dd0-4968-9bd9-66289e1f1935"
        : "", // Replace with actual ID
    name: "60 Credits",
    price: 29.9,
    credits: 60,
    type: "one_time",
    planType: "one_time",
    membership: "add_on",
    description: "One-time purchase - 60 credits",
  },
  credits_120: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "a877da46-4916-4802-bcf2-6a9717fe0519"
        : "", // Replace with actual ID
    name: "120 Credits",
    price: 49.9,
    credits: 120,
    type: "one_time",
    planType: "one_time",
    membership: "add_on",
    description: "One-time purchase - 120 credits",
  },
  credits_250: {
    id:
      process.env.NEXT_PUBLIC_POLAR_SERVER === "sandbox"
        ? "011a818b-5168-4ad6-bb6c-57c1ad5cc1f5"
        : "", // Replace with actual ID
    name: "250 Credits",
    price: 99.9,
    credits: 250,
    type: "one_time",
    planType: "one_time",
    membership: "add_on",
    description: "One-time purchase - 250 credits",
  },
};

/**
 * Get product by price and plan type (for easy lookup from existing components)
 */
export function getPolarProductByPriceAndPlan(
  price: number,
  planType: PolarPlanType,
  membership?: PolarMembership
): PolarProduct | undefined {
  return Object.values(POLAR_PRODUCTS).find((product) => {
    const priceMatch = Math.abs(product.price - price) < 0.01;
    const planMatch = product.planType === planType;
    const membershipMatch = membership
      ? product.membership === membership
      : true;
    return priceMatch && planMatch && membershipMatch;
  });
}

/**
 * Get product by Polar product ID (for webhook handling)
 */
export function getPolarProductById(
  productId: string
): PolarProduct | undefined {
  return Object.values(POLAR_PRODUCTS).find(
    (product) => product.id === productId
  );
}

/**
 * Get product key by membership and plan type
 */
export function getPolarProductKey(
  membership: PolarMembership,
  planType: PolarPlanType
): string {
  if (planType === "one_time") {
    // For one-time, we need to match by membership which contains credit info
    return `credits_${membership}`;
  }
  return `${membership}_${planType}`;
}

/**
 * Calculate credits with offer bonus (25% extra)
 */
export function calculateCreditsWithOffer(
  baseCredits: number,
  hasOffer: boolean
): number {
  return hasOffer ? Math.round(baseCredits * 1.25) : baseCredits;
}

/**
 * Polar server environment
 */
export const POLAR_SERVER =
  (process.env.NEXT_PUBLIC_POLAR_SERVER as "sandbox" | "production") ||
  "sandbox";

/**
 * Check if Polar is properly configured
 */
export function isPolarConfigured(): boolean {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  // Check if products have real IDs (not placeholders)
  const hasRealProductIds = Object.values(POLAR_PRODUCTS).some(
    (product) => !product.id.startsWith("POLAR_") && product.id.length > 10
  );

  return Boolean(accessToken && webhookSecret && hasRealProductIds);
}
