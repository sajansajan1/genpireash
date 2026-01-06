import { create } from "zustand";

type State = {
  getUserNotifications: any | null;
  loadingGetUserNotifications: boolean;
  errorGetUserNotifications: string | null;
  hasFetchedUserNotifications: boolean;
  fetchUserNotifications: () => Promise<void>;
  refresUserNotifications: () => Promise<void>;
};

export const useGetNotificationsStore = create<State>((set, get) => ({
  getUserNotifications: null,
  loadingGetUserNotifications: false,
  errorGetUserNotifications: null,
  hasFetchedUserNotifications: false,

  fetchUserNotifications: async () => {
    if (get().hasFetchedUserNotifications) return;

    set({ loadingGetUserNotifications: true, errorGetUserNotifications: null });

    try {
      const res = await fetch("/api/notifications/get-notifications");
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetUserNotifications: err.error || "Failed to fetch", loadingGetUserNotifications: false });
        return;
      }

      const ideas = await res.json();
      set({ getUserNotifications: ideas, loadingGetUserNotifications: false, hasFetchedUserNotifications: true });
    } catch (error) {
      set({ errorGetUserNotifications: "Unexpected error", loadingGetUserNotifications: false });
    }
  },

  refresUserNotifications: async () => {
    set({ hasFetchedUserNotifications: false });
    await get().fetchUserNotifications();
  },
}));
