import { create } from "zustand";

type State = {
  GetTryOnHistory: any | null;
  loadingGetTryOnHistory: boolean;
  errorGetTryOnHistory: string | null;
  hasFetchedTryOnHistory: boolean;
  fetchTryOnHistory: () => Promise<void>;
  refreshTryOnHistory: () => Promise<void>;
};

export const useGetTryOnHistoryStore = create<State>((set, get) => ({
  GetTryOnHistory: null,
  loadingGetTryOnHistory: false,
  errorGetTryOnHistory: null,
  hasFetchedTryOnHistory: false,

  fetchTryOnHistory: async () => {
    if (get().hasFetchedTryOnHistory) return;

    set({ loadingGetTryOnHistory: true, errorGetTryOnHistory: null });

    try {
      const res = await fetch("/api/ai-virtual-tryon/get-all-history");
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetTryOnHistory: err.error || "Failed to fetch", loadingGetTryOnHistory: false });
        return;
      }

      const ideas = await res.json();
      set({ GetTryOnHistory: ideas, loadingGetTryOnHistory: false, hasFetchedTryOnHistory: true });
    } catch (error) {
      set({ errorGetTryOnHistory: "Unexpected error", loadingGetTryOnHistory: false });
    }
  },

  refreshTryOnHistory: async () => {
    try {
      const res = await fetch("/api/ai-virtual-tryon/get-all-history");
      const ideas = await res.json();
      set({ GetTryOnHistory: ideas, loadingGetTryOnHistory: false, hasFetchedTryOnHistory: true });
    } catch (error) {
      console.error("Error refreshing collection history:", error);
      // set({ loadingGetCreatorDna: false });
    }

  },
}));
