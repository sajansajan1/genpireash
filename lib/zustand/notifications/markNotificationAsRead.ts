import { creatorProfile } from "@/lib/types/tech-packs";
import { create } from "zustand";

type State = {
  markNotificationAsRead: any | null;
  loadingMarkNotificationAsRead: boolean;
  errorMarkNotificationAsRead: string | null;
  hasFetchedMarkNotificationAsRead: boolean;
  setMarkNotificationAsRead: (payload: any) => Promise<any>;
  refreshMarkNotificationAsRead: () => Promise<void>;
};

export const useMarkNotificationAsReadStore = create<State>((set, get) => ({
  markNotificationAsRead: null,
  loadingMarkNotificationAsRead: false,
  errorMarkNotificationAsRead: null,
  hasFetchedMarkNotificationAsRead: false,

  setMarkNotificationAsRead: async (payload) => {
    set({ loadingMarkNotificationAsRead: true, errorMarkNotificationAsRead: null });

    try {
      const res = await fetch("/api/notifications/update-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorMarkNotificationAsRead: err.error || "Failed to fetch",
          loadingMarkNotificationAsRead: false,
        });
        return;
      }

      const data = await res.json();
      set({
        markNotificationAsRead: data,
        loadingMarkNotificationAsRead: false,
        hasFetchedMarkNotificationAsRead: true,
      });
    } catch (error) {
      set({
        errorMarkNotificationAsRead: "Unexpected error",
        loadingMarkNotificationAsRead: false,
      });
    }
  },

  refreshMarkNotificationAsRead: async () => {
    set({ hasFetchedMarkNotificationAsRead: false });
  },
}));
