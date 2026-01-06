# Real-time Credits - Usage Examples

## Quick Start Examples

### Example 1: Simple Credits Display (using existing Zustand store)

\`\`\`tsx
// components/CreditsDisplay.tsx
"use client";

import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

export function CreditsDisplay() {
  const { getCreatorCredits, loadingGetCreatorCredits } = useGetCreditsStore();

  if (loadingGetCreatorCredits) {
    return <div>Loading credits...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold">
        {getCreatorCredits?.credits || 0} Credits
      </span>
      <span className="text-sm text-gray-500">
        {getCreatorCredits?.membership || "Free"}
      </span>
    </div>
  );
}
\`\`\`

With the `RealtimeCreditsProvider` in your layout, this component will automatically update in real-time!

---

### Example 2: Credits with Live Indicator (using new hook)

\`\`\`tsx
// components/LiveCreditsDisplay.tsx
"use client";

import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";

export function LiveCreditsDisplay() {
  const { credits, isLoading, isSubscribed, refetch } = useRealtimeCredits();

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg">
      {/* Credits Amount */}
      <div className="flex-1">
        <p className="text-2xl font-bold">
          {isLoading ? "..." : credits?.credits || 0}
        </p>
        <p className="text-sm text-gray-500">Available Credits</p>
      </div>

      {/* Live Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isSubscribed ? "bg-green-500 animate-pulse" : "bg-gray-300"
          }`}
        />
        <span className="text-xs text-gray-500">
          {isSubscribed ? "Live" : "Offline"}
        </span>
      </div>

      {/* Refresh Button */}
      <button
        onClick={refetch}
        className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
      >
        Refresh
      </button>
    </div>
  );
}
\`\`\`

---

### Example 3: Credits Card with Notifications

\`\`\`tsx
// components/CreditsCard.tsx
"use client";

import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";
import { useToast } from "@/hooks/use-toast";

export function CreditsCard() {
  const { toast } = useToast();

  const { credits, isLoading } = useRealtimeCredits({
    onCreditsUpdate: (newCredits) => {
      // Show toast when credits change
      toast({
        title: "Credits Updated",
        description: `You now have ${newCredits.credits} credits`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <CreditsCardSkeleton />;
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg">
      <h3 className="text-sm font-medium opacity-90">Available Credits</h3>
      <p className="text-4xl font-bold mt-2">{credits?.credits || 0}</p>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex justify-between text-sm">
          <span>Plan:</span>
          <span className="font-semibold">{credits?.membership || "Free"}</span>
        </div>
        {credits?.expires_at && (
          <div className="flex justify-between text-sm mt-1">
            <span>Expires:</span>
            <span>{new Date(credits.expires_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditsCardSkeleton() {
  return (
    <div className="bg-gray-200 animate-pulse p-6 rounded-xl h-40" />
  );
}
\`\`\`

---

### Example 4: Credits Warning Banner

\`\`\`tsx
// components/LowCreditsWarning.tsx
"use client";

import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function LowCreditsWarning() {
  const { getCreatorCredits } = useGetCreditsStore();

  // Don't show if credits are above threshold
  if (!getCreatorCredits || getCreatorCredits.credits > 10) {
    return null;
  }

  if (getCreatorCredits.credits === 0) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Out of Credits</h4>
            <p className="text-sm text-red-700 mt-1">
              You've used all your credits. Purchase more to continue creating.
            </p>
            <Link
              href="/pricing"
              className="inline-block mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Buy Credits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-900">Low Credits</h4>
          <p className="text-sm text-yellow-700 mt-1">
            You have {getCreatorCredits.credits} credits remaining.
          </p>
          <Link
            href="/pricing"
            className="text-sm text-yellow-800 underline mt-1 inline-block"
          >
            Add more credits
          </Link>
        </div>
      </div>
    </div>
  );
}
\`\`\`

---

### Example 5: Credits in Navbar

\`\`\`tsx
// components/NavbarCredits.tsx
"use client";

import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export function NavbarCredits() {
  const { getCreatorCredits } = useGetCreditsStore();

  return (
    <Link
      href="/pricing"
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <CreditCard className="h-4 w-4" />
      <span className="font-medium">
        {getCreatorCredits?.credits || 0}
      </span>
      <span className="text-xs text-gray-500">credits</span>
    </Link>
  );
}
\`\`\`

---

### Example 6: Credits Progress Bar

\`\`\`tsx
// components/CreditsProgress.tsx
"use client";

import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";

interface CreditsProgressProps {
  maxCredits?: number; // e.g., 100 for starter plan
}

export function CreditsProgress({ maxCredits = 100 }: CreditsProgressProps) {
  const { credits, isLoading } = useRealtimeCredits();

  if (isLoading || !credits) {
    return <div className="h-2 bg-gray-200 rounded-full animate-pulse" />;
  }

  const percentage = Math.min((credits.credits / maxCredits) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Credits Used</span>
        <span className="font-medium">
          {credits.credits} / {maxCredits}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 50
              ? "bg-green-500"
              : percentage > 20
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
\`\`\`

---

### Example 7: Real-time Credits Dashboard Widget

\`\`\`tsx
// components/CreditsDashboardWidget.tsx
"use client";

import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";

export function CreditsDashboardWidget() {
  const { credits, isSubscribed } = useRealtimeCredits();
  const [previousCredits, setPreviousCredits] = useState<number | null>(null);
  const [trend, setTrend] = useState<"up" | "down" | "same">("same");

  useEffect(() => {
    if (credits && previousCredits !== null) {
      if (credits.credits > previousCredits) {
        setTrend("up");
      } else if (credits.credits < previousCredits) {
        setTrend("down");
      } else {
        setTrend("same");
      }
    }

    if (credits) {
      setPreviousCredits(credits.credits);
    }
  }, [credits, previousCredits]);

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Available Credits</p>
          <p className="text-3xl font-bold mt-1">{credits?.credits || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {credits?.membership || "Free"} Plan
          </p>
        </div>

        <div
          className={`p-2 rounded-lg ${
            trend === "up"
              ? "bg-green-100"
              : trend === "down"
              ? "bg-red-100"
              : "bg-gray-100"
          }`}
        >
          <TrendIcon
            className={`h-5 w-5 ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isSubscribed ? "bg-green-500 animate-pulse" : "bg-gray-300"
          }`}
        />
        <span className="text-xs text-gray-500">
          {isSubscribed ? "Live updates active" : "Reconnecting..."}
        </span>
      </div>
    </div>
  );
}
\`\`\`

---

### Example 8: Multi-tab Sync Demo

\`\`\`tsx
// components/MultiTabCreditsDemo.tsx
"use client";

import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";
import { useState } from "react";

export function MultiTabCreditsDemo() {
  const { credits, isSubscribed } = useRealtimeCredits();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useRealtimeCredits({
    onCreditsUpdate: () => {
      setLastUpdate(new Date());
    },
  });

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold">Multi-tab Sync Test</h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Current Credits</p>
          <p className="text-2xl font-bold">{credits?.credits || 0}</p>
        </div>

        <div>
          <p className="text-gray-500">Connection Status</p>
          <p className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isSubscribed ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            {isSubscribed ? "Connected" : "Offline"}
          </p>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-xs text-gray-500">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
        <p className="font-medium text-blue-900">Test Instructions:</p>
        <ol className="list-decimal ml-4 mt-2 space-y-1 text-blue-800">
          <li>Open this page in multiple browser tabs</li>
          <li>Update credits in Supabase dashboard</li>
          <li>Watch all tabs update simultaneously!</li>
        </ol>
      </div>
    </div>
  );
}
\`\`\`

---

## Integration Example

Here's how to add the provider to your app:

\`\`\`tsx
// app/creator-dashboard/layout.tsx
import { RealtimeCreditsProvider } from "@/lib/providers/RealtimeCreditsProvider";

export default function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeCreditsProvider>
      <div className="min-h-screen">
        {/* Your existing layout */}
        {children}
      </div>
    </RealtimeCreditsProvider>
  );
}
\`\`\`

Then use any of the components above - they'll all work with real-time updates!

---

## Testing Real-time Updates

### Test 1: Update via SQL

\`\`\`sql
-- In Supabase SQL Editor
UPDATE user_credits
SET credits = credits + 100
WHERE user_id = 'your-user-id'
AND status = 'active';
\`\`\`

Watch your UI update instantly!

### Test 2: Multi-tab Test

1. Open your app in 2+ browser tabs
2. Make a purchase or use a credit
3. See all tabs update at the same time

### Test 3: Network Interruption

1. Open DevTools → Network tab
2. Set to "Offline"
3. Credits won't update (expected)
4. Set back to "Online"
5. Credits automatically reconnect and sync

---

**Pro Tip**: Use the `isSubscribed` status to show users when they're offline!
