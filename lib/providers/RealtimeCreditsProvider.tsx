"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRealtimeCredits } from "@/lib/hooks/useRealtimeCredits";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

interface RealtimeCreditsProviderProps {
  children: React.ReactNode;
  /**
   * Enable/disable real-time subscriptions
   * @default true
   */
  enableRealtime?: boolean;
}

/**
 * Provider component that syncs real-time credits with Zustand store
 *
 * This provider:
 * 1. Subscribes to real-time credits updates via Supabase
 * 2. Automatically syncs updates to Zustand store
 * 3. Provides app-wide real-time credits synchronization
 *
 * Usage:
 * Wrap your app or dashboard layout with this provider:
 *
 * @example
 * ```tsx
 * <RealtimeCreditsProvider>
 *   <YourApp />
 * </RealtimeCreditsProvider>
 * ```
 *
 * Then use the existing Zustand store anywhere:
 * ```tsx
 * const { getCreatorCredits } = useGetCreditsStore();
 * ```
 */
export function RealtimeCreditsProvider({
  children,
  enableRealtime = true,
}: RealtimeCreditsProviderProps) {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      console.log("🚀 RealtimeCreditsProvider mounted (first time only)");
      hasMounted.current = true;
    }
  }, []);

  const setCredits = useGetCreditsStore((state) => state.setCredits);

  const handleCreditsUpdate = useCallback(
    (newCredits: any) => {
      console.log("📥 Provider received credits update:", newCredits);
      setCredits(newCredits);
    },
    [setCredits]
  );

  const handleError = useCallback((error: string) => {
    console.error("❌ Real-time credits error:", error);
  }, []);

  // Subscribe to real-time updates
  const { credits, isSubscribed, isLoading, error } = useRealtimeCredits({
    enableRealtime,
    onCreditsUpdate: handleCreditsUpdate,
    onError: handleError,
  });

  // Initial sync - only once when credits first load
  const hasInitialSync = useRef(false);
  useEffect(() => {
    if (credits && !hasInitialSync.current) {
      console.log("💾 Syncing initial credits to Zustand store:", credits);
      setCredits(credits);
      hasInitialSync.current = true;
    }
  }, [credits, setCredits]);

  // Log subscription status - only when it changes
  const prevStatus = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevStatus.current !== isSubscribed) {
      console.log("📊 Provider status:", {
        enableRealtime,
        isSubscribed,
        isLoading,
        error,
        hasCredits: !!credits,
      });
      prevStatus.current = isSubscribed;
    }
  }, [isSubscribed, enableRealtime, isLoading, error, credits]);

  return <>{children}</>;
}
