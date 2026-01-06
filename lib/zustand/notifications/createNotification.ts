import { create } from "zustand";

type State = {
  createNotification: any | null;
  loadingCreateNotification: boolean;
  errorCreateNotification: string | null;
  hasFetchedCreateNotification: boolean;
  setCreateNotification: (payload: any) => Promise<any>;
  refreshCreateNotification: () => Promise<void>;
};

export const useCreateNotificationStore = create<State>((set, get) => ({
  createNotification: null,
  loadingCreateNotification: false,
  errorCreateNotification: null,
  hasFetchedCreateNotification: false,

  setCreateNotification: async (payload) => {
    set({ loadingCreateNotification: true, errorCreateNotification: null });

    try {
      const res = await fetch("/api/notifications/create-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorCreateNotification: err.error || "Failed to fetch",
          loadingCreateNotification: false,
        });
        return;
      }

      const data = await res.json();
      set({
        createNotification: data,
        loadingCreateNotification: false,
        hasFetchedCreateNotification: true,
      });
    } catch (error) {
      set({
        errorCreateNotification: "Unexpected error",
        loadingCreateNotification: false,
      });
    }
  },

  refreshCreateNotification: async () => {
    set({ hasFetchedCreateNotification: false });
  },
}));
