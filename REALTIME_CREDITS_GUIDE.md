# Real-time Credits System Documentation

## Overview

This system provides real-time synchronization of user credits between the database (Supabase) and the client, ensuring a single source of truth.

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase)                      │
│                  user_credits table                         │
│              (SINGLE SOURCE OF TRUTH)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Realtime Events (INSERT, UPDATE, DELETE)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Realtime Channel                      │
│           (postgres_changes subscription)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           useRealtimeCredits Hook                           │
│   - Fetches initial data via server action                  │
│   - Subscribes to real-time updates                         │
│   - Auto-refetches on database changes                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        RealtimeCreditsProvider (optional)                   │
│     - Syncs real-time data to Zustand store                 │
│     - Provides app-wide synchronization                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              UI Components                                  │
│   - useGetCreditsStore() (existing)                         │
│   - useRealtimeCredits() (new, recommended)                 │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Components

### 1. Server Action (`app/actions/get-user-credits.ts`)

**Purpose**: Single source of truth for credits data

**Key Features**:
- Fetches all user credit records
- Calculates total credits from active subscriptions
- Auto-expires one-time plans with zero credits
- Handles subscription history

**Usage**:
\`\`\`typescript
import { getUserCredits } from "@/app/actions/get-user-credits";

const result = await getUserCredits();
if (result.success) {
  console.log(result.data.credits); // Total credits
}
\`\`\`

### 2. Real-time Hook (`lib/hooks/useRealtimeCredits.ts`)

**Purpose**: Provides real-time credits updates to components

**Key Features**:
- Fetches initial data on mount
- Subscribes to Supabase Realtime
- Auto-refetches when database changes
- Handles connection state
- Cleanup on unmount

**Usage**:
\`\`\`typescript
import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";

function MyComponent() {
  const { credits, isLoading, error, refetch, isSubscribed } = useRealtimeCredits({
    onCreditsUpdate: (newCredits) => {
      console.log("Credits updated:", newCredits.credits);
    },
    onError: (error) => {
      console.error("Error:", error);
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Credits: {credits?.credits}</p>
      <p>Status: {isSubscribed ? "Live" : "Offline"}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
\`\`\`

### 3. Provider (`lib/providers/RealtimeCreditsProvider.tsx`)

**Purpose**: App-wide real-time synchronization with existing Zustand store

**Key Features**:
- Wraps your app/dashboard
- Automatically syncs to Zustand store
- Maintains backward compatibility
- Zero changes needed to existing components

**Usage**:
\`\`\`typescript
// In your layout or root component
import { RealtimeCreditsProvider } from "@/lib/providers/RealtimeCreditsProvider";

export default function DashboardLayout({ children }) {
  return (
    <RealtimeCreditsProvider>
      {children}
    </RealtimeCreditsProvider>
  );
}
\`\`\`

Then use existing Zustand store anywhere:
\`\`\`typescript
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

function AnyComponent() {
  const { getCreatorCredits } = useGetCreditsStore();

  // This will now update in real-time automatically!
  return <div>Credits: {getCreatorCredits?.credits}</div>;
}
\`\`\`

### 4. Updated Zustand Store (`lib/zustand/credits/getCredits.ts`)

**Changes**:
- Now uses server action instead of API route
- Added `setCredits()` method for real-time updates
- Maintains backward compatibility
- TypeScript types added

## Setup Instructions

### Step 1: Enable Realtime on Supabase

You need to enable Realtime replication on the `user_credits` table:

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard → Database → Replication
2. Find `user_credits` table
3. Enable replication

**Option B: Using SQL**
\`\`\`sql
ALTER PUBLICATION supabase_realtime ADD TABLE user_credits;
\`\`\`

### Step 2: Add Provider to Your App

Wrap your dashboard/app with the provider:

\`\`\`typescript
// app/creator-dashboard/layout.tsx
import { RealtimeCreditsProvider } from "@/lib/providers/RealtimeCreditsProvider";

export default function Layout({ children }) {
  return (
    <RealtimeCreditsProvider>
      {children}
    </RealtimeCreditsProvider>
  );
}
\`\`\`

### Step 3: Use in Components

**Option A: Using existing Zustand store (recommended for migration)**
\`\`\`typescript
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

function MyComponent() {
  const { getCreatorCredits, loadingGetCreatorCredits } = useGetCreditsStore();

  // Now automatically updates in real-time!
  return <div>Credits: {getCreatorCredits?.credits}</div>;
}
\`\`\`

**Option B: Using the hook directly (for new components)**
\`\`\`typescript
import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";

function MyComponent() {
  const { credits, isLoading } = useRealtimeCredits();

  return <div>Credits: {credits?.credits}</div>;
}
\`\`\`

## Migration Guide

### For Existing Components Using Zustand

**No changes needed!** Just add the provider and your components will automatically get real-time updates.

**Before**:
\`\`\`typescript
const { getCreatorCredits } = useGetCreditsStore();
// Updates only on page refresh or manual refetch
\`\`\`

**After** (with provider):
\`\`\`typescript
const { getCreatorCredits } = useGetCreditsStore();
// Updates automatically in real-time when database changes!
\`\`\`

### For New Components

Use the `useRealtimeCredits` hook directly:

\`\`\`typescript
import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";

function NewComponent() {
  const { credits, isLoading, error, refetch, isSubscribed } = useRealtimeCredits();

  return (
    <div>
      <p>Credits: {credits?.credits}</p>
      <p>Membership: {credits?.membership}</p>
      <p>Connection: {isSubscribed ? "✓ Live" : "○ Offline"}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
\`\`\`

## API Reference

### `getUserCredits()` Server Action

Returns credits data from database (source of truth).

**Response**:
\`\`\`typescript
{
  success: boolean;
  data?: {
    credits: number;
    membershipStatus: string;
    planType: string;
    canBuy: boolean;
    hasEverHadSubscription: boolean;
    message: string;
    subscription_id: string | null;
    membership: string | null;
    expires_at: string | null;
  };
  error?: string;
}
\`\`\`

### `useRealtimeCredits(options)`

Hook for real-time credits updates.

**Options**:
\`\`\`typescript
{
  enableRealtime?: boolean;  // Default: true
  onCreditsUpdate?: (credits: UserCreditsData) => void;
  onError?: (error: string) => void;
}
\`\`\`

**Returns**:
\`\`\`typescript
{
  credits: UserCreditsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isSubscribed: boolean;
}
\`\`\`

### `RealtimeCreditsProvider` Props

\`\`\`typescript
{
  children: React.ReactNode;
  enableRealtime?: boolean;  // Default: true
}
\`\`\`

## Testing Real-time Updates

### Method 1: Using Supabase Dashboard

1. Open Supabase Dashboard
2. Go to Table Editor → `user_credits`
3. Update a credit record for your user
4. Watch the UI update automatically!

### Method 2: Using SQL

\`\`\`sql
-- Update credits for a specific user
UPDATE user_credits
SET credits = credits + 10
WHERE user_id = 'your-user-id'
AND status = 'active';
\`\`\`

### Method 3: Using Your App

Make a purchase or complete an action that changes credits, and watch all open tabs update simultaneously!

## Debugging

### Check Subscription Status

\`\`\`typescript
const { isSubscribed } = useRealtimeCredits();

useEffect(() => {
  console.log("Realtime status:", isSubscribed ? "Connected" : "Disconnected");
}, [isSubscribed]);
\`\`\`

### Monitor Console Logs

The system logs:
- Initial fetch
- Subscription status
- Real-time events
- Errors

Look for:
\`\`\`
Credits subscription status: SUBSCRIBED
Credits updated in real-time: { ... }
\`\`\`

### Common Issues

**Issue**: Not receiving real-time updates
**Solution**: Check that `user_credits` table has replication enabled

**Issue**: Multiple subscriptions
**Solution**: Make sure provider is only used once in your app hierarchy

**Issue**: Stale data
**Solution**: Call `refetch()` to force fresh data from server

## Performance Considerations

1. **Single Subscription**: The provider ensures only one real-time connection per user
2. **Efficient Updates**: Only refetches when database actually changes
3. **Automatic Cleanup**: Unsubscribes when component unmounts
4. **Server-side Calculation**: Total credits calculated server-side for accuracy

## Security

- Uses Supabase Row Level Security (RLS)
- Only receives updates for authenticated user's credits
- Server action validates user authentication
- No sensitive data exposed in real-time events

## Future Enhancements

Possible additions:
1. Offline support with local cache
2. Optimistic updates for instant UI feedback
3. Credit transaction history real-time updates
4. Toast notifications for credit changes
5. Multi-tab synchronization indicators

---

**Last Updated**: 2025-11-05
**Version**: 1.0.0
