"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";

interface BackgroundRefreshModalProps {
  /**
   * Time in milliseconds that the tab must be hidden before showing the modal on return
   * Default: 30000 (30 seconds)
   */
  threshold?: number;

  /**
   * Whether to automatically refresh on return, or show modal
   * Default: false (show modal)
   */
  autoRefresh?: boolean;
}

/**
 * Detects when user returns to the app after backgrounding it on mobile
 * Shows a modal prompting them to refresh if they were gone for a while
 *
 * Use case: On mobile, when user backgrounds the app during async operations,
 * JavaScript is paused. When they return, the app state may be stale.
 */
export function BackgroundRefreshModal({
  threshold = 30000, // 30 seconds
  autoRefresh = false
}: BackgroundRefreshModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [hiddenTime, setHiddenTime] = useState<number | null>(null);
  const [wasHiddenDuringRequest, setWasHiddenDuringRequest] = useState(false);

  useEffect(() => {
    let pendingRequestCount = 0;

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is being hidden/backgrounded
        console.log("📱 Tab backgrounded at:", new Date().toISOString());
        setHiddenTime(Date.now());

        // Check if there are pending requests
        if (pendingRequestCount > 0) {
          setWasHiddenDuringRequest(true);
          console.log("⚠️ Tab backgrounded during active request");
        }
      } else {
        // Tab is being shown/foregrounded
        console.log("📱 Tab foregrounded at:", new Date().toISOString());

        if (hiddenTime) {
          const timeHidden = Date.now() - hiddenTime;
          console.log(`📱 Tab was hidden for ${(timeHidden / 1000).toFixed(1)}s`);

          // If tab was hidden for longer than threshold OR hidden during a request
          if (timeHidden > threshold || wasHiddenDuringRequest) {
            console.log("🔄 Showing refresh prompt");

            if (autoRefresh) {
              window.location.reload();
            } else {
              setShowModal(true);
            }
          }

          setHiddenTime(null);
          setWasHiddenDuringRequest(false);
        }
      }
    };

    // Track fetch requests to detect if tab was backgrounded during API call
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      pendingRequestCount++;
      console.log(`📡 Request started (${pendingRequestCount} pending)`);

      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        pendingRequestCount--;
        console.log(`📡 Request completed (${pendingRequestCount} pending)`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, [threshold, autoRefresh, hiddenTime, wasHiddenDuringRequest]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowModal(false);
  };

  return (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-[#18181B] dark:text-stone-200" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg">
                Refresh Recommended
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Your session was paused while the app was in the background.
            <br />
            <br />
            To ensure you see the latest updates and avoid any issues, we recommend refreshing the page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-stone-100 dark:text-gray-300 dark:hover:bg-stone-800 rounded-md transition-colors border border-[#18181B] dark:border-stone-600"
          >
            Continue Without Refreshing
          </button>
          <AlertDialogAction
            onClick={handleRefresh}
            className="bg-[#18181B] hover:bg-[#403A35] text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
