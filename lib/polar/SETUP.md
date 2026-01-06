# Polar.sh Integration Setup Guide

This guide explains how to complete the Polar.sh payment integration.

## 1. Database Migration

Add the `polar_customer_id` column to the `user_credits` table in Supabase:

```sql
-- Add polar_customer_id column to user_credits table
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_polar_customer_id
ON user_credits(polar_customer_id);
```

## 2. Create Products in Polar Dashboard

Go to https://polar.sh/dashboard and create the following products:

### Creator Subscriptions

| Product Name | Price | Billing | Type |
|-------------|-------|---------|------|
| Saver Plan Monthly | $19.90 | Monthly | Subscription |
| Pro Plan Monthly | $39.90 | Monthly | Subscription |
| Saver Plan Yearly | $178.00 | Yearly | Subscription |
| Pro Plan Yearly | $358.00 | Yearly | Subscription |

### One-Time Credit Packages

| Product Name | Price | Type |
|-------------|-------|------|
| 30 Credits | $14.90 | One-time |
| 60 Credits | $29.90 | One-time |
| 120 Credits | $49.90 | One-time |
| 250 Credits | $99.90 | One-time |

## 3. Update Product IDs

After creating products, copy each product ID from Polar dashboard and update:

**File:** `lib/polar/config.ts`

Replace the placeholder IDs:
```typescript
export const POLAR_PRODUCTS: Record<string, PolarProduct> = {
  saver_monthly: {
    id: "YOUR_SAVER_MONTHLY_PRODUCT_ID", // <-- Replace
    // ...
  },
  // ... update all products
};
```

## 4. Configure Environment Variables

Add to your `.env.local`:

```bash
# Payment Provider
NEXT_PUBLIC_PAYMENT_PROVIDER=polar

# Polar Configuration
POLAR_ACCESS_TOKEN=polar_oat_YOUR_TOKEN_HERE
POLAR_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
NEXT_PUBLIC_POLAR_SERVER=sandbox  # or "production"
```

### Getting Polar Credentials:

1. **Access Token:**
   - Go to Polar Dashboard → Settings → Organization → Access Tokens
   - Create a new Organization Access Token (OAT)
   - Copy the token (starts with `polar_oat_`)

2. **Webhook Secret:**
   - Go to Polar Dashboard → Settings → Webhooks
   - Create a new webhook endpoint: `https://yourdomain.com/api/polar/webhooks`
   - Select events: checkout.updated, subscription.*, order.*, refund.*
   - Copy the webhook secret

## 5. Configure Webhook Events

In Polar Dashboard → Webhooks, subscribe to these events:

- `checkout.created`
- `checkout.updated`
- `subscription.created`
- `subscription.active`
- `subscription.updated`
- `subscription.canceled`
- `subscription.uncanceled`
- `subscription.revoked`
- `order.created`
- `order.paid`
- `refund.created`

## 6. Test the Integration

### Sandbox Testing:
1. Set `NEXT_PUBLIC_POLAR_SERVER=sandbox`
2. Use Polar's test payment methods
3. Verify webhooks are received at `/api/polar/webhooks`

### Production Checklist:
- [ ] All product IDs updated with production IDs
- [ ] `NEXT_PUBLIC_POLAR_SERVER=production`
- [ ] Webhook endpoint configured for production domain
- [ ] SSL certificate valid on webhook endpoint

## 7. Switching Payment Providers

To switch between Polar and PayPal:

```bash
# Use Polar
NEXT_PUBLIC_PAYMENT_PROVIDER=polar

# Use PayPal (fallback)
NEXT_PUBLIC_PAYMENT_PROVIDER=paypal
```

## File Structure

```
lib/polar/
├── config.ts          # Product configuration and helpers
└── SETUP.md           # This file

app/api/polar/
├── checkout/route.ts  # Initiates Polar checkout
├── portal/route.ts    # Customer subscription portal
└── webhooks/route.ts  # Handles all Polar events

app/polar/
└── success/page.tsx   # Payment success page
```

## Troubleshooting

### Webhooks not received:
- Check webhook URL is correct and accessible
- Verify webhook secret matches
- Check Polar Dashboard → Webhooks → Deliveries for errors

### Credits not added:
- Check webhook logs in server console
- Verify product ID mapping in `lib/polar/config.ts`
- Ensure `polar_customer_id` column exists in database

### Customer portal not working:
- Verify user has made at least one purchase
- Check `polar_customer_id` is stored in `user_credits`
