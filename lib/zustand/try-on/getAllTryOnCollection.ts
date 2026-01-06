import { create } from "zustand";

type State = {
  GetTryOnCollections: any | null;
  loadingGetTryOnCollections: boolean;
  errorGetTryOnCollections: string | null;
  hasFetchedTryOnCollections: boolean;
  fetchTryOnCollections: () => Promise<void>;
  refreshTryOnCollections: () => Promise<void>;
};

export const useGetTryOnCollectionsStore = create<State>((set, get) => ({
  GetTryOnCollections: null,
  loadingGetTryOnCollections: false,
  errorGetTryOnCollections: null,
  hasFetchedTryOnCollections: false,

  fetchTryOnCollections: async () => {
    if (get().hasFetchedTryOnCollections) return;

    set({ loadingGetTryOnCollections: true, errorGetTryOnCollections: null });

    try {
      const res = await fetch("/api/ai-virtual-tryon/get-all-tryon");
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetTryOnCollections: err.error || "Failed to fetch", loadingGetTryOnCollections: false });
        return;
      }

      const ideas = await res.json();
      set({ GetTryOnCollections: ideas, loadingGetTryOnCollections: false, hasFetchedTryOnCollections: true });
    } catch (error) {
      set({ errorGetTryOnCollections: "Unexpected error", loadingGetTryOnCollections: false });
    }
  },

  refreshTryOnCollections: async () => {
    try {
      const res = await fetch("/api/ai-virtual-tryon/get-all-tryon");
      const ideas = await res.json();
      set({ GetTryOnCollections: ideas, loadingGetTryOnCollections: false, hasFetchedTryOnCollections: true });
    } catch (error) {
      console.error("Error refreshing collection history:", error);
      // set({ loadingGetCreatorDna: false });
    }
  },
}));
