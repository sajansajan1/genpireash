import { create } from "zustand";

type State = {
  markAllNotificationsAsRead: any | null;
  loadingMarkAllNotificationsAsRead: boolean;
  errorMarkAllNotificationsAsRead: string | null;
  hasFetchedMarkAllNotificationsAsRead: boolean;
  setMarkAllNotificationsAsRead: (payload: any) => Promise<any>;
  refreshMarkAllNotificationsAsRead: () => Promise<void>;
};

export const useMarkAllNotificationsAsReadStore = create<State>((set, get) => ({
  markAllNotificationsAsRead: null,
  loadingMarkAllNotificationsAsRead: false,
  errorMarkAllNotificationsAsRead: null,
  hasFetchedMarkAllNotificationsAsRead: false,

  setMarkAllNotificationsAsRead: async (payload) => {
    set({ loadingMarkAllNotificationsAsRead: true, errorMarkAllNotificationsAsRead: null });

    try {
      const res = await fetch("/api/notifications/update-all-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorMarkAllNotificationsAsRead: err.error || "Failed to fetch",
          loadingMarkAllNotificationsAsRead: false,
        });
        return;
      }

      const data = await res.json();
      set({
        markAllNotificationsAsRead: data,
        loadingMarkAllNotificationsAsRead: false,
        hasFetchedMarkAllNotificationsAsRead: true,
      });
    } catch (error) {
      set({
        errorMarkAllNotificationsAsRead: "Unexpected error",
        loadingMarkAllNotificationsAsRead: false,
      });
    }
  },

  refreshMarkAllNotificationsAsRead: async () => {
    set({ hasFetchedMarkAllNotificationsAsRead: false });
  },
}));
