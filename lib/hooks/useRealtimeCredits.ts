"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { getUserCredits, UserCreditsData } from "@/app/actions/get-user-credits";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeCreditsOptions {
  /**
   * Enable/disable real-time subscriptions
   * @default true
   */
  enableRealtime?: boolean;

  /**
   * Callback when credits are updated
   */
  onCreditsUpdate?: (credits: UserCreditsData) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: string) => void;
}

interface UseRealtimeCreditsReturn {
  credits: UserCreditsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isSubscribed: boolean;
}

/**
 * Custom hook for real-time credits updates using Supabase Realtime
 *
 * Features:
 * - Fetches initial credits from server (single source of truth)
 * - Subscribes to real-time updates from user_credits table
 * - Auto-refetches when credits change
 * - Handles connection state and errors
 * - Cleanup on unmount
 *
 * @example
 * ```tsx
 * const { credits, isLoading, refetch } = useRealtimeCredits({
 *   onCreditsUpdate: (newCredits) => console.log('Credits updated:', newCredits)
 * });
 * ```
 */
export function useRealtimeCredits(
  options: UseRealtimeCreditsOptions = {}
): UseRealtimeCreditsReturn {
  const { enableRealtime = true, onCreditsUpdate, onError } = options;

  const [credits, setCredits] = useState<UserCreditsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isFetchingRef = useRef(false);

  // Use refs for callbacks to avoid dependency issues
  const onCreditsUpdateRef = useRef(onCreditsUpdate);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onCreditsUpdateRef.current = onCreditsUpdate;
    onErrorRef.current = onError;
  }, [onCreditsUpdate, onError]);

  /**
   * Fetch credits from server (source of truth)
   */
  const fetchCredits = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setError(null);

    try {
      const result = await getUserCredits();

      if (result.success && result.data) {
        setCredits(result.data);
        onCreditsUpdateRef.current?.(result.data);
      } else {
        const errorMessage = result.error || "Failed to fetch credits";
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
      console.error("Error fetching credits:", err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // No dependencies - uses refs instead

  /**
   * Get current user ID
   */
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    };

    getUser();
  }, []);

  /**
   * Initial fetch on mount - only after user is loaded
   */
  useEffect(() => {
    // Only fetch if user is authenticated
    if (userId) {
      fetchCredits();
    }
  }, [fetchCredits, userId]);

  /**
   * Subscribe to real-time updates
   * Only subscribe once per userId - prevents duplicate subscriptions
   */
  useEffect(() => {
    // Early return: Don't attempt subscription without userId
    if (!enableRealtime || !userId) {
      return;
    }

    // Prevent duplicate subscriptions - if already have active channel, skip
    if (channelRef.current) {
      console.log("[useRealtimeCredits] Channel already exists, skipping duplicate subscription");
      return;
    }

    console.log("[useRealtimeCredits] Setting up subscription for user:", userId);

    // Create a local reference to avoid stale closures
    let isCleanedUp = false;
    let hasConnected = false; // Track if we've connected successfully

    // Create channel for user credits updates
    const channel = supabase
      .channel(`user-credits:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Don't process if already cleaned up
          if (isCleanedUp) return;

          console.log("🔔 Credits updated in real-time:", payload);
          console.log("Event type:", payload.eventType);
          console.log("New data:", payload.new);
          console.log("Old data:", payload.old);

          // Refetch credits from server to get calculated totals
          // This ensures we always have the accurate aggregated data
          fetchCredits();
        }
      )
      .subscribe((status) => {
        // Don't process if already cleaned up
        if (isCleanedUp) {
          return;
        }

        console.log(`📡 Credits subscription status: ${status}`);

        if (status === "SUBSCRIBED") {
          hasConnected = true;
          setIsSubscribed(true);
          console.log("✅ Successfully subscribed to credits updates");

          // IMPORTANT: Refetch credits after subscription is established
          // This ensures we have the latest data, especially for new users
          // whose credits were inserted before the subscription was set up
          console.log("🔄 Refetching credits after subscription established");
          fetchCredits();
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          // Only handle errors if not cleaning up and we've never connected
          // (First connection attempt often fails immediately, then succeeds on retry)
          if (!isCleanedUp && hasConnected) {
            // Only log error if we previously had a successful connection
            setIsSubscribed(false);
            console.log("❌ Subscription lost after successful connection:", status);

            if (status === "CHANNEL_ERROR") {
              const errorMsg = "Real-time subscription error";
              setError(errorMsg);
              onErrorRef.current?.(errorMsg);
            }
          }
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or userId change
    return () => {
      isCleanedUp = true;

      if (channelRef.current) {
        console.log("🔌 Unsubscribing from credits channel");
        supabase.removeChannel(channelRef.current);
        setIsSubscribed(false);
        channelRef.current = null;
      }
    };
    // Only depend on enableRealtime and userId - callbacks are handled via refs
  }, [enableRealtime, userId]);

  return {
    credits,
    isLoading,
    error,
    refetch: fetchCredits,
    isSubscribed,
  };
}
