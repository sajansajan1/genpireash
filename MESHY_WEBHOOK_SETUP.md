# Meshy.ai Webhook Setup Guide

## Overview

This guide explains how to set up Meshy.ai webhooks for real-time 3D model generation updates. Webhooks eliminate the need for continuous polling and provide instant notifications when tasks complete or change status.

**Benefits of Webhooks:**
- ⚡ Real-time updates (no polling delay)
- 💰 Lower costs (no continuous API calls)
- 📊 Better rate limit management
- 🎯 Instant user notifications
- 🔄 Automatic database updates

---

## Prerequisites

1. **Meshy.ai Account** with API access
2. **Deployed Application** with publicly accessible HTTPS URL
3. **Environment Variables** configured

---

## Step 1: Configure Environment Variables

Add these to your `.env.local` file:

\`\`\`bash
# Meshy.ai API Configuration
MESHY_API_KEY=msy_zxwj3ZPxAysi7V2b22djdyhqEtZO91YZ1BsH
MESHY_WEBHOOK_SECRET=VFmrjveeKwMFPt5uLHl-SvPIB3XoTAgG
\`\`\`

**Important:** Keep these secrets secure! Never commit them to version control.

---

## Step 2: Deploy Your Application

The webhook endpoint must be publicly accessible via HTTPS. Meshy.ai requires HTTPS for security.

### Production Deployment

If deploying to **Vercel:**
\`\`\`bash
vercel --prod
\`\`\`

Your webhook URL will be:
\`\`\`
https://your-domain.vercel.app/api/webhooks/meshy
\`\`\`

If deploying to **another platform**, ensure:
- HTTPS is enabled
- The `/api/webhooks/meshy` endpoint is accessible
- The server responds within 30 seconds

---

## Step 3: Register Webhook in Meshy Dashboard

1. **Log in to Meshy.ai** at https://app.meshy.ai

2. **Navigate to API Settings:**
   - Click your profile/settings
   - Go to "API Settings" or "Developer Settings"

3. **Find the "Webhooks" section** (below API Keys)

4. **Click "Create Webhook"**

5. **Enter Webhook Configuration:**

   **Payload URL:**
   \`\`\`
   https://your-domain.vercel.app/api/webhooks/meshy
   \`\`\`

   **Webhook Secret:** (provided by Meshy)
   \`\`\`
   VFmrjveeKwMFPt5uLHl-SvPIB3XoTAgG
   \`\`\`

6. **Enable the Webhook:**
   - Toggle the "Active" switch
   - Check "Send webhooks to this endpoint"

7. **Save the webhook**

---

## Step 4: Verify Webhook Setup

### Method 1: Check Webhook Health Endpoint

Visit in your browser:
\`\`\`
https://your-domain.vercel.app/api/webhooks/meshy
\`\`\`

You should see:
\`\`\`json
{
  "status": "active",
  "endpoint": "/api/webhooks/meshy",
  "description": "Meshy.ai webhook receiver for 3D model generation updates",
  "timestamp": "2025-01-13T..."
}
\`\`\`

### Method 2: Test with a Real 3D Generation

1. Go to your 3D Model Gallery
2. Generate a 3D model for a product
3. Watch the server logs for webhook events:

\`\`\`bash
# If using Vercel
vercel logs

# Look for:
Received Meshy webhook: { taskId: 'xxx', status: 'PENDING', progress: 0 }
Received Meshy webhook: { taskId: 'xxx', status: 'IN_PROGRESS', progress: 50 }
Received Meshy webhook: { taskId: 'xxx', status: 'SUCCEEDED', progress: 100 }
Successfully updated 3D model record: { taskId: 'xxx', modelId: 'yyy', status: 'SUCCEEDED' }
\`\`\`

### Method 3: Check Meshy Dashboard

In Meshy's webhook settings, check:
- **Recent Deliveries** tab
- **Delivery Status** should show successful deliveries (200 OK responses)
- **Payload Examples** to see what data is being sent

---

## Step 5: Update Frontend (Optional)

The webhook automatically updates the database, but you may want to add real-time UI updates.

### Option A: Use Supabase Realtime

Enable realtime on the `product_3d_models` table:

\`\`\`sql
ALTER PUBLICATION supabase_realtime ADD TABLE product_3d_models;
\`\`\`

Subscribe to changes in your React component:

\`\`\`typescript
useEffect(() => {
  const channel = supabase
    .channel('3d-models-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'product_3d_models',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('3D model updated:', payload);
        // Refresh the UI or update specific item
        if (payload.new.status === 'SUCCEEDED') {
          toast({
            title: "3D Model Ready!",
            description: "Your 3D model has been generated successfully."
          });
          // Refresh the product list
          fetchProducts();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);
\`\`\`

### Option B: Implement Server-Sent Events (SSE)

Create an SSE endpoint that streams updates to connected clients. This is more complex but doesn't require Supabase realtime.

---

## Webhook Payload Structure

### Event Types

Meshy sends webhooks for these status changes:

1. **PENDING** - Task created, queued for processing
2. **IN_PROGRESS** - Generation started
3. **SUCCEEDED** - Generation completed successfully
4. **FAILED** - Generation failed
5. **EXPIRED** - Task expired (took too long)

### Payload Example (SUCCEEDED)

\`\`\`json
{
  "id": "019a7c1e-52e2-7396-9333-27c233812259",
  "status": "SUCCEEDED",
  "progress": 100,
  "model_urls": {
    "glb": "https://assets.meshy.ai/.../model.glb?Expires=...",
    "fbx": "https://assets.meshy.ai/.../model.fbx?Expires=...",
    "usdz": "https://assets.meshy.ai/.../model.usdz?Expires=...",
    "obj": "https://assets.meshy.ai/.../model.obj?Expires=...",
    "mtl": "https://assets.meshy.ai/.../model.mtl?Expires=..."
  },
  "thumbnail_url": "https://assets.meshy.ai/.../preview.png?Expires=...",
  "texture_urls": [
    {
      "base_color": "https://assets.meshy.ai/.../texture_0.png?Expires=...",
      "metallic": "https://assets.meshy.ai/.../texture_0_metallic.png?Expires=...",
      "roughness": "https://assets.meshy.ai/.../texture_0_roughness.png?Expires=...",
      "normal": "https://assets.meshy.ai/.../texture_0_normal.png?Expires=..."
    }
  ],
  "task_error": null,
  "finished_at": 1763019189968,
  "created_at": 1763019100000,
  "updated_at": 1763019189968
}
\`\`\`

### Payload Example (FAILED)

\`\`\`json
{
  "id": "019a7c1e-52e2-7396-9333-27c233812259",
  "status": "FAILED",
  "progress": 0,
  "task_error": {
    "message": "Invalid input images",
    "code": "INVALID_INPUT"
  },
  "finished_at": 1763019189968,
  "created_at": 1763019100000,
  "updated_at": 1763019189968
}
\`\`\`

---

## Webhook Endpoint Implementation

### File: `/app/api/webhooks/meshy/route.ts`

**Key Features:**
- ✅ Validates webhook payload
- ✅ Updates database automatically
- ✅ Handles all status types (PENDING, IN_PROGRESS, SUCCEEDED, FAILED, EXPIRED)
- ✅ Stores complete model data (all formats + textures)
- ✅ Returns 200 OK to acknowledge receipt
- ✅ Logs errors for debugging

**Webhook Flow:**

\`\`\`
1. Meshy sends POST request to /api/webhooks/meshy
   ↓
2. Endpoint validates payload structure
   ↓
3. Extract task ID, status, progress, model URLs
   ↓
4. Update database record using updateProduct3DModelByTaskId()
   ↓
5. If SUCCEEDED: Save all model URLs + textures
   If FAILED: Save error message
   If EXPIRED: Mark as expired
   ↓
6. Return 200 OK response to Meshy
   ↓
7. (Optional) Trigger real-time update to client
\`\`\`

---

## Webhook Delivery Requirements

For your webhook to continue receiving events:

### ✅ Do's

- **Return HTTP 200-299** status codes for successful processing
- **Respond within 30 seconds** (Meshy timeout)
- **Process asynchronously** if needed (acknowledge first, process later)
- **Log all webhook events** for debugging
- **Handle duplicate deliveries** gracefully (idempotent processing)

### ❌ Don'ts

- **Don't return 4xx/5xx errors** unless payload is invalid
- **Don't process synchronously** if it takes > 10 seconds
- **Don't skip validation** of the payload structure
- **Don't expose errors** to Meshy (log internally)

### Auto-Disable Policy

Meshy will **automatically disable** your webhook if:
- Multiple consecutive failures (5+ failed deliveries)
- Timeout errors (no response within 30 seconds)
- Too many 4xx/5xx responses

**If disabled:**
1. Check webhook logs in Meshy dashboard
2. Fix the issue (endpoint down, slow response, errors)
3. Re-enable the webhook manually

---

## Testing Webhooks Locally

For local development, use **ngrok** to expose your local server:

### Step 1: Install ngrok

\`\`\`bash
npm install -g ngrok
# or
brew install ngrok
\`\`\`

### Step 2: Start your local server

\`\`\`bash
npm run dev
\`\`\`

### Step 3: Expose with ngrok

\`\`\`bash
ngrok http 3000
\`\`\`

You'll get a URL like:
\`\`\`
https://abc123.ngrok.io
\`\`\`

### Step 4: Configure webhook in Meshy

Use the ngrok URL:
\`\`\`
https://abc123.ngrok.io/api/webhooks/meshy
\`\`\`

### Step 5: Test

Generate a 3D model and watch the ngrok terminal for incoming webhooks.

---

## Troubleshooting

### Issue: Webhook not receiving events

**Check:**
1. ✅ Webhook is enabled in Meshy dashboard
2. ✅ URL is correct and HTTPS
3. ✅ Endpoint is deployed and accessible (test GET request)
4. ✅ No firewall blocking Meshy's IP addresses

**Solution:**
\`\`\`bash
# Test webhook endpoint
curl https://your-domain.vercel.app/api/webhooks/meshy

# Should return:
{ "status": "active", ... }
\`\`\`

### Issue: Webhook receiving events but database not updating

**Check:**
1. ✅ Task ID exists in database (was created during generation)
2. ✅ Supabase connection is working
3. ✅ RLS policies allow updates

**Solution:**
Check server logs for database errors:
\`\`\`bash
vercel logs --follow
\`\`\`

### Issue: Webhook disabled by Meshy

**Causes:**
- Server returning 4xx/5xx errors
- Server timing out (> 30 seconds)
- Server not responding (down)

**Solution:**
1. Check Recent Deliveries in Meshy dashboard
2. Review error messages
3. Fix the issue (usually endpoint availability or timeout)
4. Re-enable webhook

### Issue: Duplicate webhook deliveries

**Cause:** Meshy may retry if response is delayed

**Solution:**
Make your webhook handler **idempotent**:

\`\`\`typescript
// Update only if status has changed
const { data: existingModel } = await getProduct3DModelByTaskId(payload.id);

if (existingModel && existingModel.status === payload.status) {
  // Already processed, return early
  return NextResponse.json({ received: true, duplicate: true });
}

// Proceed with update
await updateProduct3DModelByTaskId(payload.id, updateData);
\`\`\`

---

## Monitoring & Logging

### Server-Side Logging

The webhook endpoint logs:
- ✅ Received webhooks (task ID, status, progress)
- ✅ Database updates (success/failure)
- ✅ Processing errors

**View logs:**
\`\`\`bash
# Vercel
vercel logs --follow

# Or use your hosting platform's log viewer
\`\`\`

### Meshy Dashboard Monitoring

Check in Meshy API Settings → Webhooks:
- **Recent Deliveries**: Last 100 webhook deliveries
- **Delivery Status**: Success/failure for each
- **Response Time**: How long your endpoint took
- **Payload**: Full JSON sent to your endpoint

---

## Security Best Practices

### 1. Validate Webhook Secret

Although Meshy doesn't send a signature header (yet), you can validate:

\`\`\`typescript
// Check if webhook secret is in environment
if (MESHY_WEBHOOK_SECRET !== "VFmrjveeKwMFPt5uLHl-SvPIB3XoTAgG") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
\`\`\`

### 2. Validate Payload Structure

\`\`\`typescript
if (!payload.id || !payload.status) {
  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
\`\`\`

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

\`\`\`typescript
// Use Vercel Edge Config or Redis
const rateLimitKey = `webhook:meshy:${ip}`;
const count = await redis.incr(rateLimitKey);
await redis.expire(rateLimitKey, 60); // 1 minute window

if (count > 100) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}
\`\`\`

### 4. HTTPS Only

Meshy only sends webhooks to HTTPS URLs. Ensure:
- Production URL uses HTTPS
- SSL certificate is valid
- No mixed content warnings

---

## Migration from Polling to Webhooks

### Before (Polling)

\`\`\`typescript
// Frontend polls every 3 seconds
const pollInterval = setInterval(async () => {
  const status = await fetch(`/api/generate-3d-model?taskId=${taskId}`);
  // Check status and update UI
}, 3000);
\`\`\`

**Problems:**
- 🔴 Wastes API calls
- 🔴 Delays (3-5 second lag)
- 🔴 Rate limit issues
- 🔴 Battery drain on mobile

### After (Webhooks)

\`\`\`typescript
// No polling! Webhook updates database automatically
// Frontend can subscribe to database changes (Supabase Realtime)
// Or refresh only when user navigates back to the page
\`\`\`

**Benefits:**
- ✅ Instant updates (< 1 second)
- ✅ No wasted API calls
- ✅ Better rate limit usage
- ✅ Lower server costs

---

## Advanced: Real-Time UI Updates

### Option 1: Supabase Realtime (Recommended)

Enable on table:
\`\`\`sql
ALTER PUBLICATION supabase_realtime ADD TABLE product_3d_models;
\`\`\`

Subscribe in React:
\`\`\`typescript
const channel = supabase
  .channel('3d-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'product_3d_models'
  }, (payload) => {
    // Update UI instantly
    setProducts(prev => prev.map(p =>
      p.model_3d?.id === payload.new.id
        ? { ...p, model_3d: payload.new }
        : p
    ));
  })
  .subscribe();
\`\`\`

### Option 2: Server-Sent Events (SSE)

Create SSE endpoint:

\`\`\`typescript
// /app/api/stream/3d-updates/route.ts
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send updates when webhook receives event
      // Implementation depends on your setup
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
\`\`\`

---

## FAQ

### Q: Do I still need the polling endpoint?

**A:** Keep it as a fallback for:
- Users who initiated generation before webhooks were set up
- Testing and debugging
- Webhook delivery failures

But webhooks should be the primary method.

### Q: What if my webhook endpoint is down?

**A:** Meshy will retry several times, then disable the webhook. User will fall back to polling (if you keep that endpoint).

### Q: Can I have multiple webhooks?

**A:** Yes, up to 5 active webhooks per Meshy account. Useful for:
- Development vs. Production
- Different services (web app, mobile app, analytics)

### Q: How do I update the webhook URL?

**A:** In Meshy dashboard:
1. Delete the old webhook
2. Create a new one with the updated URL

### Q: Are webhook URLs secure?

**A:** Yes, Meshy requires HTTPS. However, you should still:
- Validate the webhook secret
- Check payload structure
- Implement rate limiting

---

## Summary

✅ **Created:** Webhook endpoint at `/app/api/webhooks/meshy/route.ts`
✅ **Configured:** Environment variables with webhook secret
✅ **Implemented:** Automatic database updates on status changes
✅ **Documented:** Complete setup and troubleshooting guide

**Next Steps:**
1. Deploy your application to get HTTPS URL
2. Register webhook in Meshy dashboard
3. Test with a real 3D generation
4. (Optional) Add real-time UI updates
5. Monitor webhook deliveries in Meshy dashboard

**Result:** Real-time 3D model updates with no polling! 🎉
