import { create } from "zustand";
import { UserDetails } from "../types/tech-packs";

type State = {
  getUserProfile: UserDetails | null;
  loadingUserProfile: boolean;
  errorUserProfile: string | null;
  hasFetchedUserProfile: boolean;
  fetchUserProfile: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

export const useUserProfileStore = create<State>((set, get) => ({
  getUserProfile: null,
  loadingUserProfile: false,
  errorUserProfile: null,
  hasFetchedUserProfile: false,

  fetchUserProfile: async () => {
    if (get().hasFetchedUserProfile) return;

    set({ loadingUserProfile: true, errorUserProfile: null });

    try {
      const res = await fetch("/api/getUserProfile");
      if (!res.ok) {
        const err = await res.json();
        set({ errorUserProfile: err.error || "Failed to fetch", loadingUserProfile: false });
        return;
      }

      const ideas = await res.json();
      set({ getUserProfile: ideas, loadingUserProfile: false, hasFetchedUserProfile: true });
    } catch (error) {
      set({ errorUserProfile: "Unexpected error", loadingUserProfile: false });
    }
  },

  refreshUserProfile: async () => {
    set({ hasFetchedUserProfile: false });
    await get().fetchUserProfile();
  },
}));
