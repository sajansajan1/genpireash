import { create } from "zustand";
import { getUserCredits, UserCreditsData } from "@/app/actions/get-user-credits";

type State = {
  getCreatorCredits: UserCreditsData | null;
  loadingGetCreatorCredits: boolean;
  errorGetCreatorCredits: string | null;
  hasFetchedCreatorCredits: boolean;
  fetchCreatorCredits: () => Promise<void>;
  refresCreatorCredits: () => Promise<void>;
  setCredits: (credits: UserCreditsData) => void;
};

/**
 * Zustand store for managing creator credits
 *
 * Now uses server actions for single source of truth
 * Compatible with real-time updates via useRealtimeCredits hook
 *
 * @deprecated Consider using useRealtimeCredits hook for real-time updates
 */
export const useGetCreditsStore = create<State>((set, get) => ({
  getCreatorCredits: null,
  loadingGetCreatorCredits: false,
  errorGetCreatorCredits: null,
  hasFetchedCreatorCredits: false,

  /**
   * Fetch credits from server (single source of truth)
   * Uses server action instead of API route for better performance
   */
  fetchCreatorCredits: async () => {
    if (get().hasFetchedCreatorCredits) return;

    set({ loadingGetCreatorCredits: true, errorGetCreatorCredits: null });

    try {
      const result = await getUserCredits();

      if (result.success && result.data) {
        set({
          getCreatorCredits: result.data,
          loadingGetCreatorCredits: false,
          hasFetchedCreatorCredits: true,
        });
      } else {
        set({
          errorGetCreatorCredits: result.error || "Failed to fetch credits",
          loadingGetCreatorCredits: false,
        });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      set({
        errorGetCreatorCredits: "Unexpected error",
        loadingGetCreatorCredits: false,
      });
    }
  },

  /**
   * Force refetch credits from server
   * Useful after transactions or when you need fresh data
   */
  refresCreatorCredits: async () => {
    set({ hasFetchedCreatorCredits: false });
    await get().fetchCreatorCredits();
  },

  /**
   * Directly set credits (used by real-time updates)
   * @param credits - New credits data from real-time subscription
   */
  setCredits: (credits: UserCreditsData) => {
    set({
      getCreatorCredits: credits,
      hasFetchedCreatorCredits: true,
      loadingGetCreatorCredits: false,
      errorGetCreatorCredits: null,
    });
  },
}));
