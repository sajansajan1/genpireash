import { Checkout } from "@polar-sh/nextjs";
import { POLAR_SERVER } from "@/lib/polar/config";

/**
 * Polar Checkout Route
 *
 * This route handles checkout initiation for Polar payments.
 * It creates a checkout session and redirects the user to Polar's hosted checkout.
 *
 * Usage: GET /api/polar/checkout?productId=xxx&userId=yyy&email=zzz
 *
 * Query params:
 * - productId (required): Polar product ID
 * - userId (optional): Your internal user ID (stored as customerExternalId)
 * - email (optional): Customer email
 * - name (optional): Customer name
 * - offer (optional): "true" if user has referral offer
 * - metadata (optional): URL-encoded JSON with additional data
 */
export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/polar/success`,
  server: POLAR_SERVER,
});
